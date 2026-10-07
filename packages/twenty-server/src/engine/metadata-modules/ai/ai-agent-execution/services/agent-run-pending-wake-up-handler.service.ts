import { Injectable, type OnModuleInit } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type QueueJobOptions } from 'src/engine/core-modules/message-queue/drivers/interfaces/job-options.interface';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { type PendingWakeUpOutcome } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-outcome.type';
import { type PendingWakeUpOwnerHandler } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-handler.type';
import { type PendingWakeUpOwnerState } from 'src/engine/core-modules/pending-wake-up/types/pending-wake-up-owner-state.type';
import { type AgentRunEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run.entity';
import { buildWaitOutcomeToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-wait-outcome-tool-output.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run.service';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// An AGENT_RUN wake-up is owned by a suspended run and keyed by the wait call it paused on
@Injectable()
export class AgentRunPendingWakeUpHandlerService
  implements PendingWakeUpOwnerHandler<AgentRunEntity>, OnModuleInit
{
  constructor(
    private readonly pendingWakeUpOwnerHandlerRegistryService: PendingWakeUpOwnerHandlerRegistryService,
    private readonly agentRunService: AgentRunService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly conversationReaderService: AgentConversationReaderService,
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
    ownerId: runId,
  }: PendingWakeUpEntity): Promise<PendingWakeUpOwnerState<AgentRunEntity>> {
    const run = await this.agentRunService.findSuspended({
      workspaceId,
      where: { id: runId },
    });

    if (!isDefined(run)) {
      return { status: 'GONE', owner: null };
    }

    const status = await this.callerHandlerRegistry
      .getHandlerOrThrow(run.caller.type)
      .getWaitingState({ workspaceId, caller: run.caller });

    return status === 'NOT_READY' ? { status } : { status, owner: run };
  }

  // the run reads what its caller lets it read
  async getReadPermissions({
    wakeUp: { workspaceId },
    owner: { caller },
  }: {
    wakeUp: PendingWakeUpEntity;
    owner: AgentRunEntity;
  }) {
    return this.callerHandlerRegistry
      .getHandlerOrThrow(caller.type)
      .buildExecutionContext({ workspaceId, caller });
  }

  async resolve({
    claimedWakeUp: { workspaceId, ownerKey: toolCallId },
    outcome,
    owner: run,
    isOwnerGone,
  }: {
    claimedWakeUp: PendingWakeUpEntity;
    outcome: PendingWakeUpOutcome;
    owner: AgentRunEntity | null;
    isOwnerGone: boolean;
  }): Promise<void> {
    if (!isDefined(run)) {
      return;
    }

    if (isOwnerGone) {
      await this.agentRunService.release({ workspaceId, run });

      return;
    }

    // the claimed wake-up is gone, so a run that cannot continue would wait forever
    try {
      await this.recordWaitOutcome({
        workspaceId,
        threadId: run.threadId,
        toolCallId,
        outcome,
      });

      await this.agentRunService.scheduleContinuation({ workspaceId, run });
    } catch (error) {
      await this.agentRunService.settle({
        workspaceId,
        run,
        outcome: {
          status: 'FAILED',
          error: `A waiting agent could not continue: ${error instanceof Error ? error.message : String(error)}`,
        },
      });

      throw error;
    }
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
  }): Promise<void> {
    const pendingPart = await this.conversationReaderService.findToolPart({
      workspaceId,
      threadId,
      toolCallId,
    });

    // an agent waits on time and events only, its questions continue it without a wake-up
    if (
      outcome.type === 'ANSWERED' ||
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
  }
}
