import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { type AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { buildWaitOutcomeToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-wait-outcome-tool-output.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// An AGENT_RUN wake-up is owned by a suspended run and keyed by the wait call it paused on
@Injectable()
export class AgentRunPendingWakeUpHandlerService
  implements PendingWakeUpOwnerHandler<AgentRunSuspensionEntity>, OnModuleInit
{
  private readonly logger = new Logger(
    AgentRunPendingWakeUpHandlerService.name,
  );

  constructor(
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
  ) {}

  onModuleInit(): void {
    this.pendingWakeUpOwnerHandlerRegistryService.register('AGENT_RUN', this);
  }

  buildResumeJobOptions(): QueueJobOptions {
    return {};
  }

  async getOwnerState({
    workspaceId,
    ownerId: suspensionId,
  }: PendingWakeUpEntity): Promise<
    PendingWakeUpOwnerState<AgentRunSuspensionEntity>
  > {
    const suspension = await this.agentRunSuspensionService.findOne({
      workspaceId,
      where: { id: suspensionId },
    });

    if (!isDefined(suspension)) {
      return { status: 'GONE', owner: null };
    }

    const status = await this.callerHandlerRegistry
      .getHandlerOrThrow(suspension.caller.type)
      .getWaitingState({ workspaceId, caller: suspension.caller });

    return status === 'NOT_READY' ? { status } : { status, owner: suspension };
  }

  // the run reads what its caller lets it read
  async getReadPermissions({
    wakeUp: { workspaceId },
    owner: { caller },
  }: {
    wakeUp: PendingWakeUpEntity;
    owner: AgentRunSuspensionEntity;
  }) {
    return this.callerHandlerRegistry
      .getHandlerOrThrow(caller.type)
      .buildExecutionContext({ workspaceId, caller });
  }

  async resolve({
    claimedWakeUp: { workspaceId, ownerKey: toolCallId },
    outcome,
    owner: suspension,
    isOwnerGone,
  }: {
    claimedWakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    owner: AgentRunSuspensionEntity | null;
    isOwnerGone: boolean;
  }): Promise<void> {
    if (!isDefined(suspension)) {
      return;
    }

    if (isOwnerGone) {
      await this.agentRunSuspensionService.release({ workspaceId, suspension });

      return;
    }

    let waitMessageId: string;

    // the claimed wake-up is gone, so a run that cannot continue would wait forever
    try {
      waitMessageId = await this.recordWaitOutcome({
        workspaceId,
        threadId: suspension.threadId,
        toolCallId,
        outcome,
      });

      await this.agentRunSuspensionService.scheduleContinuation({
        workspaceId,
        suspension,
      });
    } catch (error) {
      await this.agentRunSuspensionService.settle({
        workspaceId,
        suspension,
        outcome: {
          status: 'FAILED',
          error: `A waiting agent could not continue: ${error instanceof Error ? error.message : String(error)}`,
        },
      });

      throw error;
    }

    // the turn only shows what happened, so failing to end it must not fail a run that goes on
    await this.endWaitedTurn({ workspaceId, messageId: waitMessageId }).catch(
      (error: unknown) =>
        this.logger.warn(
          `Could not end the turn of wait message ${waitMessageId}: ${error instanceof Error ? error.message : String(error)}`,
        ),
    );
  }

  // a step can pause on a question next to the wait, and the turn waits until both are done
  private async endWaitedTurn({
    workspaceId,
    messageId,
  }: {
    workspaceId: string;
    messageId: string;
  }): Promise<void> {
    const parts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId },
      select: ['toolOutput'],
    });

    if (parts.some((part) => isAwaitingPausingToolOutput(part.toolOutput))) {
      return;
    }

    await this.turnRecorderService.endWaitingTurn({
      workspaceId,
      messageId,
      status: AgentTurnStatus.COMPLETED,
    });
  }

  // The wait call stays pending in the conversation until its wake-up resolves it, then carries the outcome
  private async recordWaitOutcome({
    workspaceId,
    threadId,
    toolCallId,
    outcome,
  }: {
    workspaceId: string;
    threadId: string;
    toolCallId: string;
    outcome: PendingWakeUpOutcome;
  }): Promise<string> {
    const pendingPart = await this.conversationReaderService.findToolPart({
      workspaceId,
      threadId,
      toolCallId,
    });

    if (
      !isDefined(pendingPart) ||
      !isAwaitingPausingToolOutput(pendingPart.toolOutput)
    ) {
      throw new AiException(
        'The waiting call could not be found in the conversation',
        AiExceptionCode.TOOL_CALL_NOT_FOUND,
      );
    }

    await this.messagePartRepository.update(
      workspaceId,
      { id: pendingPart.id },
      { toolOutput: buildWaitOutcomeToolOutput(outcome) },
    );

    return pendingPart.messageId;
  }
}
