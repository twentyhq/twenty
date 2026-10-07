import { Injectable } from '@nestjs/common';

import isEqual from 'lodash.isequal';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Raw } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { AGENT_WAIT_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-tool-names.constant';
import { closeOpenToolParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/close-open-tool-parts.util';
import { readProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-proposed-tool-call-answer.util';
import { buildWaitOutcomeToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-wait-outcome-tool-output.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunCallerWaitingState } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-waiting-state.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { type AgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-wait.type';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { isToolOutputAwaitedByCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/is-tool-output-awaited-by-caller.util';
import { AgentChatThreadRecordEventService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-record-event.service';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { AgentTurnRecorderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-turn-recorder.service';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const AGENT_RUN_OWNER_TYPE = 'AGENT_RUN';

// The suspended runs callers wait on: what continues them, and who gets their outcome
@Injectable()
export class AgentRunSuspensionService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentRunSuspensionEntity)
    private readonly suspensionRepository: WorkspaceScopedRepository<AgentRunSuspensionEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly threadRecordEventService: AgentChatThreadRecordEventService,
    private readonly turnRecorderService: AgentTurnRecorderService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findOne({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where: { id: string } | { threadId: string };
  }): Promise<AgentRunSuspensionEntity | null> {
    return this.suspensionRepository.findOne(workspaceId, { where });
  }

  async suspend({
    workspaceId,
    threadId,
    caller,
    runSpec,
    summary,
  }: {
    workspaceId: string;
    threadId: string;
    caller: AgentRunCaller;
    runSpec: AgentRunSpec | null;
    summary: AgentRunSummary | null;
  }): Promise<AgentRunSuspensionEntity> {
    return this.suspensionRepository.insertAndReturnOne(workspaceId, {
      threadId,
      caller,
      runSpec,
      summary,
    } as QueryDeepPartialEntity<AgentRunSuspensionEntity>);
  }

  // a new message must not slip in while a run waits in the conversation: the run would read it on continuing
  async assertConversationNotSuspended({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const suspension = await this.findOne({ workspaceId, where: { threadId } });

    if (isDefined(suspension)) {
      throw new AiException(
        'The conversation is waiting on an earlier run; send the next message once it has finished',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }
  }

  // A call the caller posted itself, such as a workflow step asking for approval: there is no
  // agent to continue, so the answer goes straight back to the caller. Posting again is a no-op
  async awaitCallerCall({
    workspaceId,
    threadId,
    caller,
  }: {
    workspaceId: string;
    threadId: string;
    caller: AgentRunCaller;
  }): Promise<void> {
    try {
      await this.suspend({
        workspaceId,
        threadId,
        caller,
        runSpec: null,
        summary: null,
      });
    } catch (error) {
      if (!isUniqueViolationError(error)) {
        throw error;
      }

      const existingSuspension = await this.findOne({
        workspaceId,
        where: { threadId },
      });

      // jsonb stores keys in its own order, so the stored caller is compared by value
      if (!isEqual(existingSuspension?.caller, caller)) {
        throw new AiException(
          'The conversation is waiting on another run',
          AiExceptionCode.THREAD_AWAITING_ANSWER,
        );
      }
    }
  }

  async armWait({
    workspaceId,
    suspensionId,
    wait,
  }: {
    workspaceId: string;
    suspensionId: string;
    wait: AgentRunWait;
  }): Promise<void> {
    await this.pendingWakeUpService.arm({
      workspaceId,
      owner: {
        type: AGENT_RUN_OWNER_TYPE,
        id: suspensionId,
        key: wait.toolCallId,
      },
      condition: wait.condition,
    });
  }

  async scheduleContinuation({
    workspaceId,
    suspension,
  }: {
    workspaceId: string;
    suspension: Pick<AgentRunSuspensionEntity, 'id' | 'resumeCount'>;
  }): Promise<void> {
    await this.messageQueueService.add<ContinueAgentRunJobData>(
      CONTINUE_AGENT_RUN_JOB_NAME,
      {
        workspaceId,
        suspensionId: suspension.id,
        resumeCount: suspension.resumeCount,
      },
    );
  }

  async getCallerWaitingState({
    workspaceId,
    suspension: { caller },
  }: {
    workspaceId: string;
    suspension: AgentRunSuspensionEntity;
  }): Promise<AgentRunCallerWaitingState> {
    return this.callerHandlerRegistry
      .getHandlerOrThrow(caller.type)
      .getWaitingState({ workspaceId, caller });
  }

  // The caller marks its call before it records the suspension, so a call without one is not ready yet
  async findWaitingSuspension({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<
    | { status: 'NOT_READY' }
    | { status: 'WAITING' | 'GONE'; suspension: AgentRunSuspensionEntity }
  > {
    const suspension = await this.findOne({ workspaceId, where: { threadId } });

    if (!isDefined(suspension)) {
      return { status: 'NOT_READY' };
    }

    const status = await this.getCallerWaitingState({
      workspaceId,
      suspension,
    });

    return status === 'NOT_READY' ? { status } : { status, suspension };
  }

  // The last answer continues the agent, or is itself the outcome of the call the caller proposed
  async deliverAnswer({
    workspaceId,
    suspension,
    toolResult,
  }: {
    workspaceId: string;
    suspension: AgentRunSuspensionEntity;
    toolResult: Record<string, unknown>;
  }): Promise<void> {
    if (isDefined(suspension.runSpec)) {
      await this.scheduleContinuation({ workspaceId, suspension });

      return;
    }

    const answer = readProposedToolCallAnswer(toolResult);

    await this.settle({
      workspaceId,
      suspension,
      outcome: isDefined(answer)
        ? { status: 'ANSWERED', answer }
        : {
            status: 'FAILED',
            error: 'The answer to the proposed call could not be read',
          },
    });
  }

  // A run that ended, or could not go on, leaves nothing to wait on, and its caller gets the outcome
  async settle({
    workspaceId,
    suspension,
    outcome,
    summary = suspension.summary,
  }: {
    workspaceId: string;
    suspension: AgentRunSuspensionEntity;
    outcome: AgentRunCallerOutcome;
    summary?: AgentRunSummary | null;
  }): Promise<void> {
    await this.release({ workspaceId, suspension });

    await this.callerHandlerRegistry
      .getHandlerOrThrow(suspension.caller.type)
      .onOutcome?.({
        workspaceId,
        caller: suspension.caller,
        threadId: suspension.threadId,
        outcome,
        summary,
      });
  }

  // A caller that stops waiting drops its suspended runs, such as every step of a run that ended
  async releaseForCaller({
    workspaceId,
    caller,
  }: {
    workspaceId: string;
    caller: {
      type: AgentRunCaller['type'];
      ref: Partial<AgentRunCaller['ref']>;
    };
  }): Promise<void> {
    const suspensions = await this.suspensionRepository.find(workspaceId, {
      where: {
        caller: Raw((alias) => `${alias} @> :callerFilter::jsonb`, {
          callerFilter: JSON.stringify(caller),
        }),
      },
    });

    for (const suspension of suspensions) {
      await this.release({ workspaceId, suspension });
    }
  }

  // The calls the run waits on are closed too, so they no longer look waiting
  async release({
    workspaceId,
    suspension,
  }: {
    workspaceId: string;
    suspension: Pick<AgentRunSuspensionEntity, 'id' | 'threadId'>;
  }): Promise<void> {
    await this.pendingWakeUpService.cancelAllForOwner({
      workspaceId,
      ownerType: AGENT_RUN_OWNER_TYPE,
      ownerId: suspension.id,
    });
    await this.suspensionRepository.delete(workspaceId, { id: suspension.id });
    await this.closeAwaitedCalls({
      workspaceId,
      threadId: suspension.threadId,
    });
  }

  // An answer holding the conversation's claim closes its calls itself once it finds its caller gone,
  // and a question the member asked of their own in the conversation stays open
  async closeAwaitedCalls({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    await this.closeWaitCalls({ workspaceId, threadId });

    const thread = await this.threadRepository.findOne(workspaceId, {
      where: {
        id: threadId,
        pendingQuestionMessageId: Not(IsNull()),
        activeStreamId: IsNull(),
      },
      select: ['id', 'pendingQuestionMessageId'],
    });
    const pendingQuestionMessageId = thread?.pendingQuestionMessageId;

    if (!isDefined(pendingQuestionMessageId)) {
      return;
    }

    const pendingParts = await this.messagePartRepository.find(workspaceId, {
      where: { messageId: pendingQuestionMessageId },
      select: ['toolOutput'],
    });

    if (
      !pendingParts.some((part) => isToolOutputAwaitedByCaller(part.toolOutput))
    ) {
      return;
    }

    const { affected } = await this.threadRepository.update(
      workspaceId,
      { id: threadId, pendingQuestionMessageId, activeStreamId: IsNull() },
      { pendingQuestionMessageId: null },
    );

    if (affected === 0) {
      return;
    }

    await this.threadRecordEventService.emitPendingQuestionCleared({
      workspaceId,
      threadId,
      messageId: pendingQuestionMessageId,
    });

    // the question is already cleared, so its calls must close before anything else can fail
    await closeOpenToolParts({
      messagePartRepository: this.messagePartRepository,
      messageId: pendingQuestionMessageId,
      workspaceId,
    });

    await this.turnRecorderService.endWaitingTurn({
      workspaceId,
      messageId: pendingQuestionMessageId,
      status: AgentTurnStatus.CANCELLED,
    });
  }

  // a wait call is not a question, so it stays pending until its wake-up resolves it or its run is dropped
  private async closeWaitCalls({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    await this.messagePartRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `UPDATE ${table('agentMessagePart')} part SET "toolOutput" = $2::jsonb, "updatedAt" = now()
         FROM ${table('agentMessage')} message
         WHERE message.id = part."messageId" AND message."threadId" = $1
           AND part."toolName" = ANY($3) AND part."toolOutput"->'result'->>'status' = 'pending'`,
        [
          threadId,
          JSON.stringify(buildWaitOutcomeToolOutput({ type: 'CANCELLED' })),
          AGENT_WAIT_TOOL_NAMES,
        ],
      ),
    );
  }
}
