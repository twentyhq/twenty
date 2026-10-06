import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { type AgentRunnerResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-result.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';

// Runs one agent turn and records it in its conversation
@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
  ) {}

  run(input: AgentRunnerRunInput): Promise<AgentRunnerResult> {
    const { workspaceId, conversation } = input;

    // a continued conversation is read before the run, so two runs on it must not interleave
    return conversation.isCreated
      ? this.runTurn(input)
      : this.agentRunConversationService.withThreadLock({
          workspaceId,
          threadId: conversation.threadId,
          work: () => this.runTurn(input),
        });
  }

  private async runTurn({
    workspaceId,
    conversation: { threadId, isCreated },
    conversationActor,
    caller,
    turn,
    execution,
  }: AgentRunnerRunInput): Promise<AgentRunnerResult> {
    const priorMessages = isCreated
      ? []
      : await this.conversationReaderService.loadMessages({
          workspaceId,
          threadId,
          actor: conversationActor,
        });
    const agentId = execution.agent?.id ?? null;

    const turnId = await this.recordConversation(threadId, async () =>
      this.agentRunConversationService.openTurn({
        workspaceId,
        threadId,
        title: turn.title,
        agentId,
        senderUserWorkspaceId: turn.senderUserWorkspaceId,
        senderApplicationId: turn.senderApplicationId,
        createdBy: await turn.resolveCreatedBy(),
        messages: turn.messages,
      }),
    );

    const startedAtMs = Date.now();

    let executionResult: AgentExecutionResult;

    try {
      executionResult = await withDedicatedAiTrace(() =>
        this.agentAsyncExecutorService.executeAgent({
          ...execution,
          priorMessages,
        }),
      );
    } catch (error) {
      if (isDefined(turnId)) {
        await this.recordConversation(threadId, () =>
          this.agentRunConversationService.failTurn({
            workspaceId,
            turnId,
            error,
          }),
        );
      }

      throw error;
    }

    const durationMs = Date.now() - startedAtMs;

    const closedTurn = isDefined(turnId)
      ? await this.recordConversation(threadId, () =>
          this.agentRunConversationService.closeTurn({
            workspaceId,
            threadId,
            turnId,
            title: turn.title,
            agentId,
            execution: executionResult,
            caller,
          }),
        )
      : null;

    return {
      threadId,
      outcome: this.buildOutcome({
        execution: executionResult,
        isRecorded: isDefined(closedTurn),
        isAwaitingAnswer: closedTurn?.isAwaitingAnswer ?? false,
      }),
      summary: buildAgentRunSummary({ execution: executionResult, durationMs }),
    };
  }

  // A record of the run, not its outcome, so a write failure must not fail the run
  private async recordConversation<TResult>(
    threadId: string,
    record: () => Promise<TResult>,
  ): Promise<TResult | null> {
    try {
      return await record();
    } catch (error) {
      this.logger.error(
        `Failed to record the agent turn in thread ${threadId}`,
        error instanceof Error ? error.stack : error,
      );

      return null;
    }
  }

  private buildOutcome({
    execution,
    isRecorded,
    isAwaitingAnswer,
  }: {
    execution: AgentExecutionResult;
    isRecorded: boolean;
    isAwaitingAnswer: boolean;
  }): AgentRunnerOutcome {
    if (execution.hasNoMoreAvailableCredits) {
      return { status: 'NO_CREDITS' };
    }

    if (!execution.isPaused) {
      return { status: 'COMPLETED', result: execution.result };
    }

    if (isAwaitingAnswer) {
      return { status: 'AWAITING_ANSWER' };
    }

    const lastStepToolResults =
      execution.steps[execution.steps.length - 1]?.toolResults ?? [];

    return {
      status: 'PAUSED',
      isResumable: isRecorded,
      pausedToolResults: lastStepToolResults.map(({ toolName, output }) => ({
        toolName,
        output,
      })),
    };
  }
}
