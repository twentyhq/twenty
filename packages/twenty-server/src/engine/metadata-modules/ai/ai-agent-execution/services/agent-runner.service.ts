import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  ASK_QUESTION_TOOL_NAME,
  REQUEST_FORM_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { AgentRunSuspensionEntity } from 'src/engine/metadata-modules/ai/ai-agent-execution/entities/agent-run-suspension.entity';
import { AGENT_WAIT_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/agent-wait-prompt.constant';
import { createAgentWaitTools } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/create-agent-wait-tools.util';
import { findAgentRunWait } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/wait-tools/find-agent-run-wait.util';
import { AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { AgentRunCallerHandlerRegistryService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-caller-handler-registry.service';
import { AgentRunConversationService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-conversation.service';
import { AgentRunSuspensionService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-run-suspension.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type AgentRunSummary } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-summary.type';
import { type AgentRunnerOutcome } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-outcome.type';
import { type AgentRunnerResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-runner-result.type';
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

type AgentRunnerTurnInput = Extract<AgentRunnerRunInput, { turn: unknown }>;

type AgentRunnerCallerInput = Extract<AgentRunnerRunInput, { caller: unknown }>;

// Runs an agent turn and records it in its conversation. A run a caller waits on that pauses on an
// answer or a wait is suspended: the engine continues it on its own, through this same runner,
// and hands the outcome to the caller's handler
@Injectable()
export class AgentRunnerService {
  private readonly logger = new Logger(AgentRunnerService.name);

  constructor(
    private readonly agentAsyncExecutorService: AgentAsyncExecutorService,
    private readonly agentRunConversationService: AgentRunConversationService,
    private readonly conversationReaderService: AgentConversationReaderService,
    private readonly agentRunSuspensionService: AgentRunSuspensionService,
    private readonly callerHandlerRegistry: AgentRunCallerHandlerRegistryService,
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

    const waitingState =
      await this.agentRunSuspensionService.getCallerWaitingState({
        workspaceId,
        suspension,
      });

    if (waitingState === 'GONE') {
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

    const handler = this.callerHandlerRegistry.getHandlerOrThrow(caller.type);

    let result: AgentRunnerResult;

    try {
      result = await this.runSegment({
        input: {
          workspaceId,
          conversation: { threadId, isCreated: false },
          caller,
          spec: runSpec,
          agent: await this.findAgentOrThrow({
            workspaceId,
            agentId: runSpec.agentId,
          }),
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

  private runSegment({
    input,
    suspension,
  }: {
    input: AgentRunnerRunInput;
    // the suspension a continued run resumes from
    suspension: AgentRunSuspensionEntity | null;
  }): Promise<AgentRunnerResult> {
    const { workspaceId, conversation } = input;
    const work = () => this.runTurn({ input, suspension });

    // a continued conversation is read before the run, so two runs on it must not interleave
    return conversation.isCreated
      ? work()
      : this.agentRunConversationService.withThreadLock({
          workspaceId,
          threadId: conversation.threadId,
          work,
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
      conversationActor,
    } = input;
    const { turn, execution } =
      'caller' in input ? this.buildCallerTurn(input) : input;
    const callerRun =
      'caller' in input ? { caller: input.caller, spec: input.spec } : null;

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
            threadId,
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
            isAwaitedByCaller: isDefined(callerRun),
          }),
        )
      : null;

    const summary = sumAgentRunSummaries({
      previousSummary: suspension?.summary ?? null,
      nextSummary: buildAgentRunSummary({
        execution: executionResult,
        durationMs,
      }),
    });

    return {
      threadId,
      summary,
      outcome: await this.settleTurn({
        workspaceId,
        threadId,
        callerRun,
        execution: executionResult,
        isRecorded: isDefined(closedTurn),
        isAwaitingAnswer: closedTurn?.isAwaitingAnswer ?? false,
        summary,
        suspension,
      }),
    };
  }

  private async settleTurn({
    workspaceId,
    threadId,
    callerRun,
    execution,
    isRecorded,
    isAwaitingAnswer,
    summary,
    suspension,
  }: {
    workspaceId: string;
    threadId: string;
    callerRun: { caller: AgentRunCaller; spec: AgentRunSpec } | null;
    execution: AgentExecutionResult;
    isRecorded: boolean;
    isAwaitingAnswer: boolean;
    summary: AgentRunSummary;
    suspension: AgentRunSuspensionEntity | null;
  }): Promise<AgentRunnerOutcome> {
    if (!execution.hasNoMoreAvailableCredits && !execution.isPaused) {
      return { status: 'COMPLETED', result: execution.result };
    }

    const wait = findAgentRunWait(
      execution.steps[execution.steps.length - 1]?.toolResults ?? [],
    );

    // continuing reads the conversation, so a pause it does not hold could never be continued
    const suspensionId =
      !execution.hasNoMoreAvailableCredits &&
      isDefined(callerRun) &&
      isRecorded &&
      (isAwaitingAnswer || isDefined(wait))
        ? await this.keepSuspended({
            workspaceId,
            threadId,
            callerRun,
            summary,
            suspension,
          })
        : null;

    if (!isDefined(suspensionId)) {
      // a pause the run could not keep leaves nothing to answer
      if (isDefined(callerRun) && !isDefined(suspension)) {
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
      await this.agentRunSuspensionService.armWait({
        workspaceId,
        suspensionId,
        wait,
      });
    }

    return { status: 'SUSPENDED', suspensionId };
  }

  // A failure to suspend only fails the run, like a pause that could not be recorded
  private async keepSuspended({
    workspaceId,
    threadId,
    callerRun: { caller, spec },
    summary,
    suspension,
  }: {
    workspaceId: string;
    threadId: string;
    callerRun: { caller: AgentRunCaller; spec: AgentRunSpec };
    summary: AgentRunSummary;
    suspension: AgentRunSuspensionEntity | null;
  }): Promise<string | null> {
    try {
      if (!isDefined(suspension)) {
        const { id } = await this.agentRunSuspensionService.suspend({
          workspaceId,
          threadId,
          caller,
          runSpec: spec,
          summary,
        });

        return id;
      }

      // a caller that stopped waiting while the run went on has released it
      const { affected } = await this.suspensionRepository.update(
        workspaceId,
        { id: suspension.id },
        { summary } as QueryDeepPartialEntity<AgentRunSuspensionEntity>,
      );

      return affected === 0 ? null : suspension.id;
    } catch (error) {
      this.logger.error(
        `Failed to suspend the agent run in thread ${threadId}`,
        error instanceof Error ? error.stack : error,
      );

      return null;
    }
  }

  // The toolset and prompt come from the spec alone, so a continued run gets those it paused with
  private buildCallerTurn({
    workspaceId,
    spec,
    agent,
    prompt,
    executionContext,
    resolveCreatedBy,
  }: AgentRunnerCallerInput): Pick<AgentRunnerTurnInput, 'turn' | 'execution'> {
    const messages = isDefined(prompt)
      ? [{ role: 'user' as const, content: prompt }]
      : [];
    const { canAskHumans, canProposeToolCalls, canWait } = spec.capabilities;

    return {
      turn: {
        title: spec.title,
        senderUserWorkspaceId: executionContext.userWorkspaceId,
        senderApplicationId: null,
        messages,
        resolveCreatedBy,
      },
      execution: {
        agent,
        messages,
        // the wait tools are the engine's, so it explains them; the caller's own instructions come last
        baseSystemPrompt: [
          spec.baseSystemPrompt,
          ...(canWait ? [AGENT_WAIT_PROMPT] : []),
          ...(isNonEmptyString(spec.instructions) ? [spec.instructions] : []),
        ].join('\n\n'),
        pausingTools: {
          ...(canWait ? createAgentWaitTools() : {}),
          ...(canAskHumans
            ? {
                [ASK_QUESTION_TOOL_NAME]: createAskQuestionTool({
                  isWorkspaceSetupThread: false,
                }),
                [REQUEST_FORM_TOOL_NAME]: createRequestFormTool(),
              }
            : {}),
        },
        canProposeToolCalls,
        actorContext: executionContext.actorContext,
        authContext: executionContext.authContext,
        workspaceId,
        userWorkspaceId: executionContext.userWorkspaceId,
        additionalRoleRestrictionIds:
          executionContext.additionalRoleRestrictionIds,
        additionalExcludedToolNames: spec.additionalExcludedToolNames,
      },
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

  private async findAgentOrThrow({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string | null;
  }): Promise<AgentEntity | null> {
    if (!isDefined(agentId)) {
      return null;
    }

    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: agentId },
    });

    if (!isDefined(agent)) {
      throw new AiException(
        `Agent with id ${agentId} not found`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    return agent;
  }
}
