import { Injectable } from '@nestjs/common';

import { type AgentRunSummary } from 'twenty-shared/ai';
import { type PendingWakeUpCondition } from 'twenty-shared/pending-wake-up';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Raw } from 'typeorm';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { AGENT_WAIT_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-tool-names.constant';
import { buildWaitOutcomeToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-wait-outcome-tool-output.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunSuspension } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-suspension.type';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { AgentTurnStatus } from 'src/engine/metadata-modules/ai/ai-history/enums/agent-turn-status.enum';
import { AgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/agent-history-repository';
import { InjectAgentHistoryRepository } from 'src/engine/metadata-modules/ai/ai-history/repositories/inject-agent-history-repository.decorator';
import { type AgentChatThreadWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-chat-thread.workspace-entity';
import { type AgentMessagePartWorkspaceEntity } from 'src/engine/metadata-modules/ai/ai-history/standard-objects/agent-message-part.workspace-entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

// one key for every run, so the owner's unique key leaves a conversation one suspended run
const SUSPENDED_RUN_WAKE_UP_KEY = 'RUN';

// A suspended run is the AGENT_RUN wake-up its conversation owns: what wakes it up, and in its
// payload what continues it and who gets its outcome
@Injectable()
export class AgentRunSuspensionService {
  constructor(
    @InjectWorkspaceScopedRepository(PendingWakeUpEntity)
    private readonly wakeUpRepository: WorkspaceScopedRepository<PendingWakeUpEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async suspend({
    workspaceId,
    threadId,
    condition,
    suspension,
  }: {
    workspaceId: string;
    threadId: string;
    condition: PendingWakeUpCondition;
    suspension: AgentRunSuspension;
  }): Promise<void> {
    await this.pendingWakeUpService.arm({
      workspaceId,
      owner: {
        type: 'AGENT_RUN',
        id: threadId,
        key: SUSPENDED_RUN_WAKE_UP_KEY,
      },
      condition,
      payload: suspension,
    });
  }

  // a run waiting in the conversation would read a new message on continuing, and a caller waiting
  // on a call it posted there would see the message close it
  async isConversationWaiting({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<boolean> {
    return this.wakeUpRepository.exists(workspaceId, {
      where: [
        { ownerType: 'AGENT_RUN', ownerId: threadId },
        {
          condition: Raw((alias) => `${alias} @> :condition::jsonb`, {
            condition: JSON.stringify({ type: 'ANSWER', threadId }),
          }),
        },
      ],
    });
  }

  async assertConversationNotSuspended({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    if (await this.isConversationWaiting({ workspaceId, threadId })) {
      throw new AiException(
        'The conversation is waiting on an earlier run; send the next message once it has finished',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }
  }

  async scheduleContinuation(jobData: ContinueAgentRunJobData): Promise<void> {
    await this.messageQueueService.add<ContinueAgentRunJobData>(
      CONTINUE_AGENT_RUN_JOB_NAME,
      jobData,
    );
  }

  // A run that ended, or could not go on, leaves nothing to wait on, and its caller gets the outcome
  async settle({
    workspaceId,
    threadId,
    suspension: { caller, summary: suspendedSummary },
    outcome,
    summary = suspendedSummary,
    isAwaitingAnswer = false,
  }: {
    workspaceId: string;
    threadId: string;
    suspension: AgentRunSuspension;
    outcome: AgentRunCallerOutcome;
    summary?: AgentRunSummary | null;
    isAwaitingAnswer?: boolean;
  }): Promise<void> {
    await this.closeAwaitedCalls({ workspaceId, threadId, isAwaitingAnswer });

    await this.callerHandlerRegistry
      .getHandlerOrThrow(caller.type)
      .onOutcome?.({ workspaceId, caller, threadId, outcome, summary });
  }

  // A caller that stops waiting drops its suspended runs, such as every step of a run that ended
  async releaseForCaller({
    workspaceId,
    caller,
  }: {
    workspaceId: string;
    // matched by containment, so a partial ref releases every run it covers
    caller: AgentRunCaller;
  }): Promise<void> {
    const wakeUps = await this.wakeUpRepository.find(workspaceId, {
      where: {
        ownerType: 'AGENT_RUN',
        payload: Raw((alias) => `${alias} @> :payload::jsonb`, {
          payload: JSON.stringify({ caller }),
        }),
      },
    });

    for (const wakeUp of wakeUps) {
      await this.release({ workspaceId, wakeUp });
    }
  }

  // A run that is dropped no longer waits, nor do the calls it waited on
  async release({
    workspaceId,
    wakeUp: { id, ownerId: threadId, condition },
  }: {
    workspaceId: string;
    wakeUp: PendingWakeUpEntity;
  }): Promise<void> {
    if (
      isDefined(
        await this.pendingWakeUpService.claim({ workspaceId, wakeUpId: id }),
      )
    ) {
      await this.closeAwaitedCalls({
        workspaceId,
        threadId,
        isAwaitingAnswer: condition.type === 'ANSWER',
      });
    }
  }

  // The calls a dropped run waited on are closed, so they no longer look waiting. An answer holding
  // the conversation's claim closes its calls itself, and a question the member asked of their own
  // stays open, as only a run that waited on an answer closes the pending question
  async closeAwaitedCalls({
    workspaceId,
    threadId,
    isAwaitingAnswer,
  }: {
    workspaceId: string;
    threadId: string;
    isAwaitingAnswer: boolean;
  }): Promise<void> {
    await this.recordWaitOutcome({
      workspaceId,
      threadId,
      outcome: { type: 'CANCELLED' },
    });

    if (isAwaitingAnswer) {
      await this.closePendingQuestion({ workspaceId, threadId });
    }
  }

  // A wait call stays pending in the conversation until its wake-up resolves it, then carries the outcome
  async recordWaitOutcome({
    workspaceId,
    threadId,
    outcome,
  }: {
    workspaceId: string;
    threadId: string;
    outcome: Parameters<typeof buildWaitOutcomeToolOutput>[0];
  }): Promise<void> {
    await this.messagePartRepository.query(workspaceId, ({ manager, table }) =>
      manager.query(
        `UPDATE ${table('agentMessagePart')} part SET "toolOutput" = $2::jsonb, "updatedAt" = now()
         FROM ${table('agentMessage')} message
         WHERE message.id = part."messageId" AND message."threadId" = $1
           AND part."toolName" = ANY($3) AND part."toolOutput"->'result'->>'status' = 'pending'`,
        [
          threadId,
          JSON.stringify(buildWaitOutcomeToolOutput(outcome)),
          AGENT_WAIT_TOOL_NAMES,
        ],
      ),
    );
  }

  // A call a caller posted stops waiting with the caller's wake-up
  async closePostedCalls({
    workspaceId,
    cancelledWakeUps,
  }: {
    workspaceId: string;
    cancelledWakeUps: PendingWakeUpEntity[];
  }): Promise<void> {
    for (const { condition } of cancelledWakeUps) {
      if (condition.type === 'ANSWER') {
        await this.closePendingQuestion({
          workspaceId,
          threadId: condition.threadId,
          toolCallId: condition.toolCallId,
        });
      }
    }
  }

  // without a call to look for, the pending question is the one waited on
  private async closePendingQuestion({
    workspaceId,
    threadId,
    toolCallId,
  }: {
    workspaceId: string;
    threadId: string;
    toolCallId?: string;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: {
        id: threadId,
        pendingQuestionMessageId: Not(IsNull()),
        activeStreamId: IsNull(),
      },
      select: ['id', 'pendingQuestionMessageId'],
    });
    const messageId = thread?.pendingQuestionMessageId;

    if (
      !isDefined(messageId) ||
      (isDefined(toolCallId) &&
        !(await this.messagePartRepository.existsBy(workspaceId, {
          messageId,
          toolCallId,
        })))
    ) {
      return;
    }

    await this.threadLifecycleService.closePendingQuestion({
      workspaceId,
      threadId,
      messageId,
      activeStreamId: null,
      turnStatus: AgentTurnStatus.CANCELLED,
    });
  }
}
