import { Injectable } from '@nestjs/common';

import isEqual from 'lodash.isequal';
import { type AgentRunSummary } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Not, Raw } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { InjectMessageQueue } from 'src/engine/core-modules/message-queue/decorators/message-queue.decorator';
import { MessageQueue } from 'src/engine/core-modules/message-queue/message-queue.constants';
import { MessageQueueService } from 'src/engine/core-modules/message-queue/services/message-queue.service';
import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { CONTINUE_AGENT_RUN_JOB_NAME } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/continue-agent-run-job-name.constant';
import { AgentRunEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run.entity';
import { AGENT_WAIT_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-tool-names.constant';
import { readProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/read-proposed-tool-call-answer.util';
import { buildWaitOutcomeToolOutput } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/build-wait-outcome-tool-output.util';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunCallerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-outcome.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { isToolOutputAwaitedByCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/is-tool-output-awaited-by-caller.util';
import { AgentChatThreadLifecycleService } from 'src/engine/metadata-modules/ai/ai-chat/services/agent-chat-thread-lifecycle.service';
import { isUniqueViolationError } from 'src/engine/metadata-modules/ai/ai-chat/utils/is-unique-violation-error.util';
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
    runSpec: AgentRunSpec | null;
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

  // a new message must not slip in while a run waits in the conversation: the run would read it on continuing
  async assertConversationNotSuspended({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<void> {
    const run = await this.findSuspended({ workspaceId, where: { threadId } });

    if (isDefined(run)) {
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

      const existingRun = await this.findSuspended({
        workspaceId,
        where: { threadId },
      });

      // jsonb stores keys in its own order, so the stored caller is compared by value
      if (!isEqual(existingRun?.caller, caller)) {
        throw new AiException(
          'The conversation is waiting on another run',
          AiExceptionCode.THREAD_AWAITING_ANSWER,
        );
      }
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

  // The caller marks its call before it suspends the run, so a call without one is not ready yet
  async findWaitingRun({
    workspaceId,
    threadId,
  }: {
    workspaceId: string;
    threadId: string;
  }): Promise<
    | { status: 'NOT_READY' }
    | { status: 'WAITING' | 'GONE'; run: AgentRunEntity }
  > {
    const run = await this.findSuspended({ workspaceId, where: { threadId } });

    if (!isDefined(run)) {
      return { status: 'NOT_READY' };
    }

    const status = await this.callerHandlerRegistry
      .getHandlerOrThrow(run.caller.type)
      .getWaitingState({ workspaceId, caller: run.caller });

    return status === 'NOT_READY' ? { status } : { status, run };
  }

  // The last answer continues the agent, or is itself the outcome of the call the caller proposed
  async deliverAnswer({
    workspaceId,
    run,
    toolResult,
  }: {
    workspaceId: string;
    run: AgentRunEntity;
    toolResult: Record<string, unknown>;
  }): Promise<void> {
    if (isDefined(run.runSpec)) {
      await this.scheduleContinuation({ workspaceId, run });

      return;
    }

    const answer = readProposedToolCallAnswer(toolResult);

    await this.settle({
      workspaceId,
      run,
      outcome: isDefined(answer)
        ? {
            status: 'COMPLETED',
            result: { threadId: run.threadId, ...answer },
          }
        : {
            status: 'FAILED',
            error: 'The answer to the proposed call could not be read',
          },
    });
  }

  // kept on the run, so whoever started it can read how it ended
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
  }): Promise<void> {
    await this.runRepository.update(workspaceId, { id: runId }, {
      status: outcome.status,
      outcome:
        outcome.status === 'COMPLETED'
          ? { result: outcome.result }
          : { error: outcome.error },
      summary,
    } as QueryDeepPartialEntity<AgentRunEntity>);
  }

  // A run that ended, or could not go on, leaves nothing to wait on, and its caller gets the outcome
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
    await this.pendingWakeUpService.cancel({
      workspaceId,
      owner: { type: 'AGENT_RUN', id: run.id },
    });
    await this.recordOutcome({ workspaceId, runId: run.id, outcome, summary });
    await this.closeAwaitedCalls({ workspaceId, threadId: run.threadId });

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
      { id: run.id },
      { status: 'CANCELLED' },
    );
    await this.closeAwaitedCalls({ workspaceId, threadId: run.threadId });
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

    await this.threadLifecycleService.closePendingQuestion({
      workspaceId,
      threadId,
      messageId: pendingQuestionMessageId,
      activeStreamId: null,
      turnStatus: AgentTurnStatus.CANCELLED,
    });
  }
}
