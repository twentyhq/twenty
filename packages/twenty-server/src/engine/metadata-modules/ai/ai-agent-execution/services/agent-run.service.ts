import { Injectable } from '@nestjs/common';

import { type AgentRunSummary } from 'twenty-shared/ai';
import { type AgentRunStatus } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Raw } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { type PendingWakeUpEntity } from 'src/engine/core-modules/pending-wake-up/entities/pending-wake-up.entity';
import { PendingWakeUpOwnerHandlerRegistryService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-owner-handler-registry.service';
import { PendingWakeUpResolverService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up-resolver.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { AgentRunEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run.entity';
import { AGENT_WAIT_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-tool-names.constant';
import { readProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-proposed-tool-call-answer.util';
import { buildWaitOutcomeToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-wait-outcome-tool-output.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { type AgentCallAwaiter } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-call-awaiter.type';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
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

const AGENT_RUN_ONGOING_STATUSES: AgentRunStatus[] = ['RUNNING', 'SUSPENDED'];

// Agent runs from start to end: what continues a suspended one, and who gets its outcome
@Injectable()
export class AgentRunService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentRunEntity)
    private readonly runRepository: WorkspaceScopedRepository<AgentRunEntity>,
    @InjectAgentHistoryRepository('agentChatThread')
    private readonly threadRepository: AgentHistoryRepository<AgentChatThreadWorkspaceEntity>,
    @InjectAgentHistoryRepository('agentMessagePart')
    private readonly messagePartRepository: AgentHistoryRepository<AgentMessagePartWorkspaceEntity>,
    private readonly threadLifecycleService: AgentChatThreadLifecycleService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    private readonly pendingWakeUpOwnerHandlerRegistry: PendingWakeUpOwnerHandlerRegistryService,
    private readonly pendingWakeUpResolverService: PendingWakeUpResolverService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    @InjectMessageQueue(MessageQueue.aiQueue)
    private readonly messageQueueService: MessageQueueService,
  ) {}

  async findOne({
    workspaceId,
    id,
  }: {
    workspaceId: string;
    id: string;
  }): Promise<AgentRunEntity | null> {
    return this.runRepository.findOne(workspaceId, { where: { id } });
  }

  async findSuspended({
    workspaceId,
    where,
  }: {
    workspaceId: string;
    where: { id: string } | { threadId: string };
  }): Promise<AgentRunEntity | null> {
    return this.runRepository.findOne(workspaceId, {
      where: { ...where, status: 'SUSPENDED' },
    });
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
    runSpec: AgentRunSpec;
    summary: AgentRunSummary | null;
  }): Promise<AgentRunEntity> {
    return this.runRepository.insertAndReturnOne(workspaceId, {
      threadId,
      caller,
      runSpec,
      status: 'SUSPENDED',
      summary,
    } as QueryDeepPartialEntity<AgentRunEntity>);
  }

  // a new message must not slip in while a run waits in the conversation, as the run would read it
  // on continuing, nor while a caller waits on a call it posted there, as the message would close it
  async assertConversationNotSuspended({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const [run, answerWakeUp] = await Promise.all([
      this.findSuspended({ workspaceId, where: { threadId } }),
      this.pendingWakeUpService.findAnswerWakeUp({ workspaceId, threadId }),
    ]);

    if (isDefined(run) || isDefined(answerWakeUp)) {
      throw new AiException(
        'The conversation is waiting on an earlier run; send the next message once it has finished',
        AiExceptionCode.THREAD_AWAITING_ANSWER,
      );
    }
  }

  async scheduleContinuation({
    workspaceId,
    run,
  }: {
    workspaceId: string;
    run: Pick<AgentRunEntity, 'id' | 'resumeCount'>;
  }): Promise<void> {
    await this.messageQueueService.add<ContinueAgentRunJobData>(
      CONTINUE_AGENT_RUN_JOB_NAME,
      {
        workspaceId,
        runId: run.id,
        resumeCount: run.resumeCount,
      },
    );
  }

  // A call a caller posted, such as a workflow step asking for approval, is awaited by its ANSWER
  // wake-up; any other one by the run suspended in the conversation, which asked it
  async findAwaiter({
    workspaceId,
    threadId,
    toolCallId,
  }: {
    workspaceId: string;
    threadId: string;
    toolCallId: string;
  }): Promise<AgentCallAwaiter | null> {
    const wakeUp = await this.pendingWakeUpService.findAnswerWakeUp({
      workspaceId,
      threadId,
      toolCallId,
    });

    if (isDefined(wakeUp)) {
      const { status } = await this.pendingWakeUpOwnerHandlerRegistry
        .getHandlerOrThrow(wakeUp.ownerType)
        .getOwnerState(wakeUp);

      return { status, wakeUp };
    }

    const run = await this.findSuspended({ workspaceId, where: { threadId } });

    if (!isDefined(run)) {
      return null;
    }

    const status = await this.callerHandlerRegistry
      .getHandlerOrThrow(run.caller.type)
      .getWaitingState({ workspaceId, caller: run.caller });

    return { status, run };
  }

  // The last answer continues the agent, or is itself the outcome of the call the caller posted
  async deliverAnswer({
    workspaceId,
    threadId,
    awaiter,
    toolResult,
  }: {
    workspaceId: string;
    threadId: string;
    awaiter: AgentCallAwaiter;
    toolResult: Record<string, unknown>;
  }): Promise<void> {
    if ('run' in awaiter) {
      await this.scheduleContinuation({ workspaceId, run: awaiter.run });

      return;
    }

    const answer = readProposedToolCallAnswer(toolResult);

    await this.pendingWakeUpResolverService.resolve({
      workspaceId,
      wakeUpId: awaiter.wakeUp.id,
      answer: isDefined(answer)
        ? { result: { threadId, ...answer } }
        : { error: 'The answer to the proposed call could not be read' },
    });
  }

  // an answer that cannot be delivered fails whoever waits on it, rather than leaving it waiting
  async failAnswer({
    workspaceId,
    awaiter,
    error,
  }: {
    workspaceId: string;
    awaiter: AgentCallAwaiter;
    error: string;
  }): Promise<void> {
    if ('run' in awaiter) {
      await this.settle({
        workspaceId,
        run: awaiter.run,
        outcome: { status: 'FAILED', error },
      });

      return;
    }

    await this.pendingWakeUpResolverService.resolve({
      workspaceId,
      wakeUpId: awaiter.wakeUp.id,
      answer: { error },
    });
  }

  async releaseAwaiter({
    workspaceId,
    awaiter,
  }: {
    workspaceId: string;
    awaiter: AgentCallAwaiter;
  }): Promise<void> {
    if ('run' in awaiter) {
      await this.release({ workspaceId, run: awaiter.run });

      return;
    }

    await this.pendingWakeUpService.claim({
      workspaceId,
      wakeUpId: awaiter.wakeUp.id,
    });
  }

  // kept on the run, so whoever started it can read how it ended. A run that already ended, as one
  // its caller dropped while it went on, keeps its end, so false tells the outcome reaches no one
  async recordOutcome({
    workspaceId,
    runId,
    outcome,
    summary,
  }: {
    workspaceId: string;
    runId: string;
    outcome: AgentRunCallerOutcome;
    summary: AgentRunSummary | null;
  }): Promise<boolean> {
    const { affected } = await this.runRepository.update(
      workspaceId,
      { id: runId, status: In(AGENT_RUN_ONGOING_STATUSES) },
      {
        status: outcome.status,
        outcome:
          outcome.status === 'COMPLETED'
            ? { result: outcome.result }
            : { error: outcome.error },
        summary,
      } as QueryDeepPartialEntity<AgentRunEntity>,
    );

    return affected !== 0;
  }

  // A run that ended leaves nothing to wait on: its wake-ups and the calls it waited on are closed
  async end({
    workspaceId,
    run,
    outcome,
    summary,
  }: {
    workspaceId: string;
    run: Pick<AgentRunEntity, 'id' | 'threadId'>;
    outcome: AgentRunCallerOutcome;
    summary: AgentRunSummary | null;
  }): Promise<boolean> {
    if (
      !(await this.recordOutcome({
        workspaceId,
        runId: run.id,
        outcome,
        summary,
      }))
    ) {
      return false;
    }

    await this.pendingWakeUpService.cancel({
      workspaceId,
      owner: { type: 'AGENT_RUN', id: run.id },
    });
    await this.closeAwaitedCalls({ workspaceId, run });

    return true;
  }

  // A run that ended, or could not go on, hands its outcome to its caller
  async settle({
    workspaceId,
    run,
    outcome,
    summary = run.summary,
  }: {
    workspaceId: string;
    run: AgentRunEntity;
    outcome: AgentRunCallerOutcome;
    summary?: AgentRunSummary | null;
  }): Promise<void> {
    if (!(await this.end({ workspaceId, run, outcome, summary }))) {
      return;
    }

    await this.callerHandlerRegistry
      .getHandlerOrThrow(run.caller.type)
      .onOutcome?.({
        workspaceId,
        caller: run.caller,
        threadId: run.threadId,
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
    const runs = await this.runRepository.find(workspaceId, {
      where: {
        status: 'SUSPENDED',
        caller: Raw((alias) => `${alias} @> :callerFilter::jsonb`, {
          callerFilter: JSON.stringify(caller),
        }),
      },
    });

    for (const run of runs) {
      await this.release({ workspaceId, run });
    }
  }

  // The calls the run waits on are closed too, so they no longer look waiting
  async release({
    workspaceId,
    run,
  }: {
    workspaceId: string;
    run: Pick<AgentRunEntity, 'id' | 'threadId'>;
  }): Promise<void> {
    await this.pendingWakeUpService.cancel({
      workspaceId,
      owner: { type: 'AGENT_RUN', id: run.id },
    });
    await this.runRepository.update(
      workspaceId,
      { id: run.id, status: In(AGENT_RUN_ONGOING_STATUSES) },
      { status: 'CANCELLED' },
    );
    await this.closeAwaitedCalls({ workspaceId, run });
  }

  // An answer holding the conversation's claim closes its calls itself once it finds its caller gone,
  // and a question the member asked of their own before the run started stays open
  async closeAwaitedCalls({
    workspaceId,
    run: { id: runId, threadId },
  }: {
    workspaceId: string;
    run: Pick<AgentRunEntity, 'id' | 'threadId'>;
  }): Promise<void> {
    // a wait call is not a question, so it stays pending until its wake-up resolves it or its run is dropped
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

    await this.closePendingQuestion({
      workspaceId,
      threadId,
      isAwaited: async (messageId) => {
        const run = await this.findOne({ workspaceId, id: runId });

        return (
          isDefined(run) &&
          this.messagePartRepository.query(
            workspaceId,
            async ({ manager, table }) =>
              (
                await manager.query(
                  `SELECT 1 FROM ${table('agentMessage')} WHERE id = $1 AND "createdAt" >= $2`,
                  [messageId, run.createdAt],
                )
              ).length > 0,
          )
        );
      },
    });
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
          isAwaited: (messageId) =>
            this.messagePartRepository.existsBy(workspaceId, {
              messageId,
              toolCallId: condition.toolCallId,
            }),
        });
      }
    }
  }

  private async closePendingQuestion({
    workspaceId,
    threadId,
    isAwaited,
  }: {
    workspaceId: string;
    threadId: string;
    isAwaited: (messageId: string) => Promise<boolean>;
  }): Promise<void> {
    const thread = await this.threadRepository.findOne(workspaceId, {
      where: {
        id: threadId,
        pendingQuestionMessageId: Not(IsNull()),
        activeStreamId: IsNull(),
      },
      select: ['id', 'pendingQuestionMessageId'],
    });
    const pendingQuestionMessageId = thread?.pendingQuestionMessageId;

    if (
      !isDefined(pendingQuestionMessageId) ||
      !(await isAwaited(pendingQuestionMessageId))
    ) {
      return;
    }

    await this.threadLifecycleService.closePendingQuestion({
      workspaceId,
      threadId,
      messageId: pendingQuestionMessageId,
      activeStreamId: null,
      turnStatus: AgentTurnStatus.CANCELLED,
    });
  }
}
