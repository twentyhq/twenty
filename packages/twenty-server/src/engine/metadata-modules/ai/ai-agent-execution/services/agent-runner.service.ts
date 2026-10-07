import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  ASK_QUESTION_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
  type AgentRunSummary,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { PendingWakeUpService } from 'src/engine/core-modules/pending-wake-up/services/pending-wake-up.service';
import { AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { AGENT_WAIT_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-prompt.constant';
import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';
import { findAgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/find-agent-run-wait.util';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { type AgentRunnerRunInput } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-run-input.type';
import { type ContinueAgentRunJobData } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/continue-agent-run-job-data.type';
import { buildAgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-summary.util';
import { sumAgentRunSummaries } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/sum-agent-run-summaries.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { createAskQuestionTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/ask-question.tool';
import { createRequestFormTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/request-form.tool';
import { AgentConversationReaderService } from 'src/engine/metadata-modules/ai/ai-history/services/agent-conversation-reader.service';
import { withDedicatedAiTrace } from 'src/engine/metadata-modules/ai/ai-models/utils/with-dedicated-ai-trace.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const AGENT_RUN_MAX_CONTINUATIONS = 50;

type AgentRunnerResult = {
  threadId: string;
  outcome: AgentRunnerOutcome;
  // the run so far, across every segment of a continued run
  summary: AgentRunSummary;
};

// Runs an agent turn and records it in its conversation. A run that pauses on an answer or a wait
// is suspended: the engine continues it on its own, through this same runner, and hands the
// outcome to its caller's handler
@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
    private readonly pendingWakeUpService: PendingWakeUpService,
    @InjectWorkspaceScopedRepository(AgentRunSuspensionEntity)
    private readonly suspensionRepository: WorkspaceScopedRepository<AgentRunSuspensionEntity>,
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  run(input: AgentRunnerRunInput): Promise<AgentRunnerResult> {
    return this.runSegment({ input, suspension: null });
  }

  // Picks a suspended run up where it paused, with its answer or wait outcome already in its conversation
  async continue({
    workspaceId,
    suspensionId,
    resumeCount,
  }: ContinueAgentRunJobData): Promise<void> {
    const suspension = await this.agentRunSuspensionService.findOne({
      workspaceId,
      where: { id: suspensionId },
    });

    if (
      !isDefined(suspension) ||
      !isDefined(suspension.runSpec) ||
      suspension.resumeCount !== resumeCount
    ) {
      return;
    }

    const { caller, runSpec, threadId } = suspension;
    const handler = this.callerHandlerRegistry.getHandlerOrThrow(caller.type);

    if ((await handler.getWaitingState({ workspaceId, caller })) === 'GONE') {
      await this.agentRunSuspensionService.release({ workspaceId, suspension });

      return;
    }

    // each continuation moves the count on, so of two deliveries of one continuation only the first runs
    const { affected } = await this.suspensionRepository.update(
      workspaceId,
      { id: suspensionId, resumeCount },
      { resumeCount: resumeCount + 1 },
    );

    if (affected === 0) {
      return;
    }

    let result: AgentRunnerResult;

    try {
      const agent = isDefined(runSpec.agentId)
        ? await this.agentRepository.findOne(workspaceId, {
            where: { id: runSpec.agentId },
          })
        : null;

      if (isDefined(runSpec.agentId) && !isDefined(agent)) {
        throw new AiException(
          `Agent with id ${runSpec.agentId} not found`,
          AiExceptionCode.AGENT_NOT_FOUND,
        );
      }

      result = await this.runSegment({
        input: {
          workspaceId,
          conversation: { threadId, isCreated: false },
          caller,
          spec: runSpec,
          agent,
          prompt: null,
          executionContext: await handler.buildExecutionContext({
            workspaceId,
            caller,
          }),
          resolveCreatedBy: () =>
            handler.resolveTurnAuthor({ workspaceId, caller }),
        },
        suspension,
      });
    } catch (error) {
      await this.agentRunSuspensionService.settle({
        workspaceId,
        suspension,
        outcome: {
          status: 'FAILED',
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return;
    }

    if (result.outcome.status !== 'SUSPENDED') {
      await this.agentRunSuspensionService.settle({
        workspaceId,
        suspension,
        outcome: result.outcome,
        summary: result.summary,
      });
    }
  }

  // nothing else writes to the conversation while the run goes on: another run would read it half
  // written, and a run that suspends would read a member's message once it goes on
  private runSegment({
    input,
    suspension,
  }: {
    input: AgentRunnerRunInput;
    // the suspension a continued run resumes from
    suspension: AgentRunSuspensionEntity | null;
  }): Promise<AgentRunnerResult> {
    return this.agentRunConversationService.withThreadLock({
      workspaceId: input.workspaceId,
      threadId: input.conversation.threadId,
      work: () => this.runTurn({ input, suspension }),
    });
  }

  private async runTurn({
    input,
    suspension,
  }: {
    input: AgentRunnerRunInput;
    suspension: AgentRunSuspensionEntity | null;
  }): Promise<AgentRunnerResult> {
    const {
      workspaceId,
      conversation: { threadId, isCreated },
      spec,
      agent,
      prompt,
      executionContext,
    } = input;
    const agentId = agent?.id ?? null;

    if (!isCreated && !isDefined(suspension)) {
      await this.agentRunSuspensionService.assertConversationNotSuspended({
        workspaceId,
        threadId,
      });
    }

    const priorMessages = isCreated
      ? []
      : await this.conversationReaderService.loadMessages({
          workspaceId,
          threadId,
          actor: executionContext.conversationActor,
        });

    const turnId = await this.tryRecording(
      `record the agent turn in thread ${threadId}`,
      async () =>
        this.agentRunConversationService.openTurn({
          workspaceId,
          threadId,
          title: spec.title,
          agentId,
          senderUserWorkspaceId: prompt?.senderUserWorkspaceId ?? null,
          senderApplicationId: prompt?.senderApplicationId ?? null,
          createdBy: await input.resolveCreatedBy(),
          messages: prompt?.messages ?? [],
        }),
    );

    const startedAtMs = Date.now();

    let execution: AgentExecutionResult;

    try {
      // the toolset and prompt come from the spec alone, so a continued run gets those it paused with
      execution = await withDedicatedAiTrace(() =>
        this.agentAsyncExecutorService.executeAgent({
          agent,
          messages: prompt?.messages ?? [],
          priorMessages,
          // every run here goes on in the background, unlike a chat, so it can wait. The wait tools are
          // the engine's, so it explains them; the caller's own instructions come last
          baseSystemPrompt: [
            spec.baseSystemPrompt,
            AGENT_WAIT_PROMPT,
            ...(isNonEmptyString(spec.instructions) ? [spec.instructions] : []),
          ].join('\n\n'),
          pausingTools: {
            ...createAgentWaitTools(),
            ...(spec.capabilities.canAskHumans
              ? {
                  [ASK_QUESTION_TOOL_NAME]: createAskQuestionTool({
                    isWorkspaceSetupThread: false,
                  }),
                  [REQUEST_FORM_TOOL_NAME]: createRequestFormTool(),
                }
              : {}),
          },
          canProposeToolCalls: spec.capabilities.canAskHumans,
          actorContext: executionContext.actorContext,
          authContext: executionContext.authContext,
          workspaceId,
          userWorkspaceId: executionContext.userWorkspaceId,
          runAsRoleId: executionContext.runAsRoleId,
          additionalRoleRestrictionIds:
            executionContext.additionalRoleRestrictionIds,
          additionalExcludedToolNames: spec.additionalExcludedToolNames,
          toolLoadingStrategy: spec.toolLoadingStrategy,
          usageOperationType: executionContext.usageOperationType,
        }),
      );
    } catch (error) {
      if (isDefined(turnId)) {
        await this.tryRecording(
          `record the agent turn in thread ${threadId}`,
          () =>
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
      ? await this.tryRecording(
          `record the agent turn in thread ${threadId}`,
          () =>
            this.agentRunConversationService.closeTurn({
              workspaceId,
              threadId,
              turnId,
              title: spec.title,
              agentId,
              execution,
            }),
        )
      : null;

    const summary = sumAgentRunSummaries({
      previousSummary: suspension?.summary ?? null,
      nextSummary: buildAgentRunSummary({ execution, durationMs }),
    });

    return {
      threadId,
      summary,
      outcome: await this.settleTurn({
        input,
        execution,
        closedTurn,
        summary,
        suspension,
      }),
    };
  }

  private async settleTurn({
    input: { workspaceId, conversation, caller, spec },
    execution,
    closedTurn,
    summary,
    suspension,
  }: {
    input: AgentRunnerRunInput;
    execution: AgentExecutionResult;
    // null when the turn could not be recorded
    closedTurn: { isAwaitingAnswer: boolean } | null;
    summary: AgentRunSummary;
    suspension: AgentRunSuspensionEntity | null;
  }): Promise<AgentRunnerOutcome> {
    if (!execution.hasNoMoreAvailableCredits && !execution.isPaused) {
      return { status: 'COMPLETED', result: execution.result };
    }

    const { threadId } = conversation;
    const wait = findAgentRunWait(
      execution.steps[execution.steps.length - 1]?.toolResults ?? [],
    );
    const hasPausedTooOften =
      isDefined(suspension) &&
      suspension.resumeCount + 1 >= AGENT_RUN_MAX_CONTINUATIONS;

    // continuing reads the conversation, so a pause it does not hold could never be continued.
    // A failure to suspend only fails the run, like a pause that could not be recorded
    const suspensionId =
      !execution.hasNoMoreAvailableCredits &&
      !hasPausedTooOften &&
      isDefined(closedTurn) &&
      (closedTurn.isAwaitingAnswer || isDefined(wait))
        ? await this.tryRecording(
            `suspend the agent run in thread ${threadId}`,
            async () => {
              if (!isDefined(suspension)) {
                return (
                  await this.agentRunSuspensionService.suspend({
                    workspaceId,
                    threadId,
                    caller,
                    runSpec: spec,
                    summary,
                  })
                ).id;
              }

              // a caller that stopped waiting while the run went on has released it
              const { affected } = await this.suspensionRepository.update(
                workspaceId,
                { id: suspension.id },
                { summary } as QueryDeepPartialEntity<AgentRunSuspensionEntity>,
              );

              return affected === 0 ? null : suspension.id;
            },
          )
        : null;

    if (!isDefined(suspensionId)) {
      // a pause the run could not keep leaves nothing to answer
      if (!isDefined(suspension)) {
        await this.agentRunSuspensionService.closeAwaitedCalls({
          workspaceId,
          threadId,
        });
      }

      if (execution.hasNoMoreAvailableCredits) {
        return {
          status: 'FAILED',
          error: 'Agent stopped: no more available credits.',
        };
      }

      if (hasPausedTooOften) {
        return {
          status: 'FAILED',
          error: `Agent stopped: it paused more than ${AGENT_RUN_MAX_CONTINUATIONS} times in one run.`,
        };
      }

      if (isDefined(wait)) {
        return {
          status: 'FAILED',
          error:
            'Agent paused to wait but its conversation could not be recorded.',
        };
      }

      return {
        status: 'FAILED',
        error: 'Agent asked a question that could not be recorded.',
      };
    }

    if (isDefined(wait)) {
      await this.pendingWakeUpService.arm({
        workspaceId,
        owner: { type: 'AGENT_RUN', id: suspensionId, key: wait.toolCallId },
        condition: wait.condition,
      });
    }

    return { status: 'SUSPENDED', suspensionId };
  }

  // A record of the run, not its outcome, so a write failure must not fail the run
  private async tryRecording<TResult>(
    description: string,
    record: () => Promise<TResult>,
  ): Promise<TResult | null> {
    try {
      return await record();
    } catch (error) {
      this.logger.error(
        `Failed to ${description}`,
        error instanceof Error ? error.stack : error,
      );

      return null;
    }
  }
}
