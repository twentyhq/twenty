import { Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentCallerConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-caller-conversation.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import {
  type AgentRunnerOutcome,
  type AgentRunnerResult,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-result.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';

// Runs an agent for a caller that drives it, such as a workflow step, and
// records the run in the caller's conversation
@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly agentCallerConversationService: AgentCallerConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
  ) {}

  async run({
    workspaceId,
    conversation,
    caller,
    title,
    agent,
    prompt,
    resolveCreatedBy,
    baseSystemPrompt,
    pausingTools,
    canProposeToolCalls,
    authContext,
    actorContext,
    userWorkspaceId,
    additionalRoleRestrictionIds,
    additionalExcludedToolNames,
  }: AgentRunnerRunInput): Promise<AgentRunnerResult> {
    const { threadId } = conversation;
    const priorMessages = conversation.isCreated
      ? []
      : await this.conversationReaderService.loadMessages({
          workspaceId,
          threadId,
        });

    // A record of the run, not its outcome, so a write failure must not fail the run
    const recordConversation = async <TResult>(
      record: () => Promise<TResult>,
    ): Promise<TResult | null> => {
      try {
        return await record();
      } catch (error) {
        this.logger.warn(
          `Failed to record the conversation ${threadId} of ${caller.type} ${JSON.stringify(caller.ref)}: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );

        return null;
      }
    };

    const turnId = await recordConversation(async () =>
      this.agentCallerConversationService.openTurn({
        workspaceId,
        threadId,
        agentId: agent?.id ?? null,
        prompt,
        senderUserWorkspaceId: userWorkspaceId,
        createdBy: await resolveCreatedBy(),
      }),
    );

    const startedAtMs = Date.now();

    let execution: AgentExecutionResult;

    try {
      execution = await this.agentAsyncExecutorService.executeAgent({
        agent,
        messages: isDefined(prompt) ? [{ role: 'user', content: prompt }] : [],
        priorMessages,
        baseSystemPrompt,
        pausingTools,
        canProposeToolCalls,
        actorContext,
        authContext,
        workspaceId,
        userWorkspaceId,
        additionalRoleRestrictionIds,
        additionalExcludedToolNames,
      });
    } catch (error) {
      if (isDefined(turnId)) {
        await recordConversation(() =>
          this.agentCallerConversationService.failTurn({
            workspaceId,
            turnId,
            error,
          }),
        );
      }

      throw error;
    }

    const durationMs = Date.now() - startedAtMs;

    const recordedTurn = isDefined(turnId)
      ? await recordConversation(() =>
          this.agentCallerConversationService.closeTurn({
            workspaceId,
            threadId,
            turnId,
            caller,
            title,
            agentId: agent?.id ?? null,
            execution,
          }),
        )
      : null;

    return {
      threadId,
      outcome: this.buildOutcome({
        execution,
        isRecorded: isDefined(recordedTurn),
        isAwaitingAnswer: recordedTurn?.isAwaitingAnswer ?? false,
      }),
      summary: buildAgentRunSummary({ execution, durationMs }),
    };
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
