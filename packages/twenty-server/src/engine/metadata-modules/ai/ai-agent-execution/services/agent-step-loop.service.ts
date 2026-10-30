import { Injectable, Logger } from '@nestjs/common';

import { type ProviderOptions } from '@ai-sdk/provider-utils';
import {
  isStepCount,
  type ModelMessage,
  NoOutputGeneratedError,
  type StepResult,
  type StopCondition,
  streamText,
  type SystemModelMessage,
  type ToolSet,
} from 'ai';
import { isDefined, sortKeysDeeply } from 'twenty-shared/utils';

import { AI_LATENCY_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/ai-latency-ms-bucket-boundaries.constant';
import { TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-execution-duration-ms-bucket-boundaries.constant';
import { TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-output-tokens-bucket-boundaries.constant';
import { ExceptionHandlerService } from 'src/engine/core-modules/exception-handler/exception-handler.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { estimateToolOutputTokens } from 'src/engine/core-modules/tool-provider/utils/estimate-tool-output-tokens.util';
import { getToolMetricName } from 'src/engine/core-modules/tool-provider/utils/get-tool-metric-name.util';
import { isToolOutputSuccessful } from 'src/engine/core-modules/tool-provider/utils/is-tool-output-successful.util';
import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';
import { type UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { type UsageSpenders } from 'src/engine/core-modules/usage/types/usage-spenders.type';
import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/ends-on-pausing-tool-call.util';
import {
  getCacheProviderOptions,
  injectCacheBreakpoint,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/provider-options.util';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import {
  AiBillingService,
  type WebSearchOperationType,
} from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { type StepDebitResult } from 'src/engine/metadata-modules/ai/ai-billing/types/step-debit-result.type';
import {
  extractCacheCreationTokens,
  extractCacheCreationTokensFromSteps,
} from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { type RegisteredAiModel } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// chat and agent runs report to their own metric keys, so existing dashboards keep their series
type AgentStepLoopMetricsScope = 'chat' | 'agent';

type ToolMetricKeys = {
  succeeded: MetricsKeys;
  failed: MetricsKeys;
  durationMs: MetricsKeys;
  outputTokens: MetricsKeys;
};

const METRICS_CONFIG_BY_SCOPE: Record<
  AgentStepLoopMetricsScope,
  {
    toolMetricKeys: ToolMetricKeys;
    stepTokensLogTag: string;
    recordsTurnMetrics: boolean;
  }
> = {
  chat: {
    toolMetricKeys: {
      succeeded: MetricsKeys.AiChatToolExecutionSucceeded,
      failed: MetricsKeys.AiChatToolExecutionFailed,
      durationMs: MetricsKeys.AiChatToolExecutionDurationMs,
      outputTokens: MetricsKeys.AiChatToolOutputTokens,
    },
    stepTokensLogTag: 'AI_CHAT_TOKENS',
    recordsTurnMetrics: true,
  },
  agent: {
    toolMetricKeys: {
      succeeded: MetricsKeys.WorkflowAgentToolExecutionSucceeded,
      failed: MetricsKeys.WorkflowAgentToolExecutionFailed,
      durationMs: MetricsKeys.WorkflowAgentToolExecutionDurationMs,
      outputTokens: MetricsKeys.WorkflowAgentToolOutputTokens,
    },
    stepTokensLogTag: 'AI_AGENT_TOKENS',
    recordsTurnMetrics: false,
  },
};

export type AgentStepLoopInput = {
  registeredModel: RegisteredAiModel;
  modelConfig: Pick<AiModelConfig, 'sdkPackage' | 'modelFamily'>;
  systemPrompt: string;
  contextMessages?: SystemModelMessage[];
  messages: ModelMessage[];
  tools: ToolSet;
  toolChoice?: 'auto' | 'required';
  abortSignal?: AbortSignal;
  offeredPausingToolNames: string[];
  shouldStopAfterStep?: StopCondition<ToolSet>;
  billing: {
    workspaceId: string;
    operationType: UsageOperationType;
    webSearchOperationType: WebSearchOperationType;
    spenders: UsageSpenders;
  };
  onUserCreditsExhausted?: (notice: {
    renewsAt: Date;
    isFallingBackToWorkspaceCredits: boolean;
  }) => Promise<void>;
  telemetry: Parameters<typeof buildAiTelemetry>[0];
  providerOptions?: ProviderOptions;
  streamRetries?: number;
  beforeStep?: () => Promise<unknown>;
  metricsScope: AgentStepLoopMetricsScope;
  onError?: (error: unknown) => void;
};

export type AgentStepLoop = {
  stream: ReturnType<typeof streamText<ToolSet>>;
  getStopReason: () => StepDebitResult['stopReason'];
};

const sumSteps = (
  steps: StepResult<ToolSet>[],
  read: (usage: StepResult<ToolSet>['usage']) => number | undefined,
): number => steps.reduce((total, { usage }) => total + (read(usage) ?? 0), 0);

const isExpectedLoopEnd = (error: unknown): boolean =>
  (error instanceof Error && error.name === 'AbortError') ||
  (error instanceof AiException &&
    error.code === AiExceptionCode.STREAM_INTERRUPTED) ||
  NoOutputGeneratedError.isInstance(error);

@Injectable()
export class AgentStepLoopService {
  private readonly logger = new Logger(AgentStepLoopService.name);

  constructor(
    private readonly aiBillingService: AiBillingService,
    private readonly metricsService: MetricsService,
    private readonly exceptionHandlerService: ExceptionHandlerService,
  ) {}

  start({
    registeredModel,
    modelConfig,
    systemPrompt,
    contextMessages = [],
    messages,
    tools,
    toolChoice = 'auto',
    abortSignal,
    offeredPausingToolNames,
    shouldStopAfterStep,
    billing,
    telemetry,
    providerOptions,
    streamRetries,
    beforeStep,
    metricsScope,
    onError,
    onUserCreditsExhausted,
  }: AgentStepLoopInput): AgentStepLoop {
    const { toolMetricKeys, stepTokensLogTag, recordsTurnMetrics } =
      METRICS_CONFIG_BY_SCOPE[metricsScope];
    const modelAttributes = { model: registeredModel.modelId };
    const finishedSteps: StepResult<ToolSet>[] = [];
    const startedAt = performance.now();
    let stopReason: StepDebitResult['stopReason'] = null;
    let userCreditsUsedMicro = 0;
    let stepStartedAt = startedAt;
    let isUsageRecorded = false;
    let isFirstTokenRecorded = !recordsTurnMetrics;

    const notifyUserCreditsCrossing = async (debit: StepDebitResult) => {
      if (
        isDefined(debit.userAllowanceExhaustedUntil) &&
        debit.userCreditsUsedMicro > 0
      ) {
        await onUserCreditsExhausted?.({
          renewsAt: debit.userAllowanceExhaustedUntil,
          isFallingBackToWorkspaceCredits: debit.stopReason === null,
        });
      }
    };

    // credits were taken step by step; the run's usage is recorded once, however it ends
    const recordUsage = async (steps: StepResult<ToolSet>[]) => {
      if (isUsageRecorded) {
        return;
      }

      isUsageRecorded = true;

      const webSearchDebit = await this.aiBillingService.recordStepsUsage({
        modelId: registeredModel.modelId,
        steps,
        ...billing,
        userCreditsUsedMicro,
      });

      if (isDefined(webSearchDebit) && stopReason !== 'userAllowance') {
        await notifyUserCreditsCrossing(webSearchDebit);
      }

      if (!recordsTurnMetrics) {
        return;
      }

      for (const [key, amount] of [
        [
          MetricsKeys.AiChatInputTokens,
          sumSteps(steps, (usage) => usage.inputTokens),
        ],
        [
          MetricsKeys.AiChatOutputTokens,
          sumSteps(steps, (usage) => usage.outputTokens),
        ],
        [
          MetricsKeys.AiChatCacheReadTokens,
          sumSteps(steps, (usage) => usage.inputTokenDetails?.cacheReadTokens),
        ],
        [
          MetricsKeys.AiChatCacheWriteTokens,
          extractCacheCreationTokensFromSteps(steps),
        ],
      ] as const) {
        this.metricsService.incrementCounterBy({
          key,
          amount,
          attributes: modelAttributes,
        });
      }

      this.metricsService.recordHistogram({
        key: MetricsKeys.AiChatTurnLatencyMs,
        value: performance.now() - startedAt,
        unit: 'ms',
        attributes: modelAttributes,
        bucketBoundaries: AI_LATENCY_MS_BUCKET_BOUNDARIES,
      });
    };

    const systemMessage: SystemModelMessage = {
      role: 'system',
      content: systemPrompt,
      providerOptions: getCacheProviderOptions(modelConfig),
    };

    const stream = streamText({
      model: registeredModel.model,
      instructions: [systemMessage, ...contextMessages],
      messages,
      tools,
      toolChoice,
      abortSignal,
      streamRetries,
      stopWhen: async (step) =>
        isDefined(stopReason) ||
        endsOnPausingToolCall({
          steps: step.steps,
          offeredToolNames: offeredPausingToolNames,
        }) ||
        (await isStepCount(AGENT_CONFIG.MAX_STEPS)(step)) ||
        (await (shouldStopAfterStep?.(step) ?? false)),
      ...buildAiTelemetry(telemetry),
      providerOptions,
      // keys are sorted and the last message carries the cache point, so the prompt prefix stays cacheable
      prepareStep: async ({ messages: stepMessages }) => {
        await beforeStep?.();
        stepStartedAt = performance.now();

        return {
          messages: injectCacheBreakpoint(
            stepMessages.map(sortKeysDeeply),
            modelConfig,
          ),
        };
      },
      onChunk: ({ chunk }) => {
        if (
          isFirstTokenRecorded ||
          (chunk.type !== 'text-delta' && chunk.type !== 'tool-call')
        ) {
          return;
        }

        isFirstTokenRecorded = true;
        this.metricsService.recordHistogram({
          key: MetricsKeys.AiChatTtftMs,
          value: performance.now() - startedAt,
          unit: 'ms',
          attributes: modelAttributes,
          bucketBoundaries: AI_LATENCY_MS_BUCKET_BOUNDARIES,
        });
      },
      onError: onError ? ({ error }) => onError(error) : undefined,
      onToolExecutionEnd: (event) => {
        this.metricsService.recordHistogram({
          key: toolMetricKeys.durationMs,
          value: event.toolExecutionMs,
          unit: 'ms',
          attributes: {
            ...modelAttributes,
            tool: getToolMetricName(event.toolCall.toolName),
          },
          bucketBoundaries: TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES,
        });
      },
      onStepEnd: async (step) => {
        finishedSteps.push(step);

        if (recordsTurnMetrics) {
          this.metricsService.recordHistogram({
            key: MetricsKeys.AiChatStepLatencyMs,
            value: performance.now() - stepStartedAt,
            unit: 'ms',
            attributes: modelAttributes,
            bucketBoundaries: AI_LATENCY_MS_BUCKET_BOUNDARIES,
          });
        }

        const stepDebit =
          await this.aiBillingService.decrementAndCheckAvailableCredits({
            modelId: registeredModel.modelId,
            billingInput: {
              usage: step.usage,
              cacheCreationTokens: extractCacheCreationTokens(
                step.providerMetadata,
              ),
            },
            workspaceId: billing.workspaceId,
            operationType: billing.operationType,
            spenders: billing.spenders,
          });

        stopReason ??= stepDebit.stopReason;
        userCreditsUsedMicro += stepDebit.userCreditsUsedMicro;

        await notifyUserCreditsCrossing(stepDebit);

        this.logStepTokens({
          step,
          stepTokensLogTag,
          stepIndex: finishedSteps.length,
        });
        this.recordToolResultMetrics({ step, toolMetricKeys, modelAttributes });
      },
      onAbort: ({ steps }) => recordUsage(steps),
      repairToolCall: ({
        toolCall,
        tools: toolsForRepair,
        inputSchema,
        error,
      }) =>
        repairToolCall({
          toolCall,
          tools: toolsForRepair,
          inputSchema,
          error,
          model: registeredModel.model,
          billingContext: {
            aiBillingService: this.aiBillingService,
            modelId: registeredModel.modelId,
            workspaceId: billing.workspaceId,
            spenders: billing.spenders,
            operationType: billing.operationType,
          },
        }),
    });

    Promise.all([stream.usage, stream.steps])
      .then(
        ([, steps]) => steps,
        (error) => {
          if (!isExpectedLoopEnd(error)) {
            this.exceptionHandlerService.captureExceptions([error]);
          }

          return [...finishedSteps];
        },
      )
      .then(recordUsage)
      .catch((error) =>
        this.exceptionHandlerService.captureExceptions([error]),
      );

    return {
      stream,
      getStopReason: () => stopReason,
    };
  }

  private logStepTokens({
    step,
    stepTokensLogTag,
    stepIndex,
  }: {
    step: StepResult<ToolSet>;
    stepTokensLogTag: string;
    stepIndex: number;
  }): void {
    this.logger.log(
      `[${stepTokensLogTag}] step #${stepIndex} — ` +
        `toolCallIds=[${step.toolCalls.map((toolCall) => toolCall.toolCallId).join(', ')}]: ` +
        `outputTokens=${step.usage.outputTokens ?? 0}, ` +
        `reasoningTokens=${step.usage.outputTokenDetails?.reasoningTokens ?? 0}, ` +
        `inputTokens(fullContext)=${step.usage.inputTokens ?? 0}, ` +
        `cacheReadTokens=${step.usage.inputTokenDetails?.cacheReadTokens ?? 0}, ` +
        `cacheWriteTokens=${step.usage.inputTokenDetails?.cacheWriteTokens ?? 0}, ` +
        `cacheCreationTokens=${extractCacheCreationTokens(step.providerMetadata)}, ` +
        `totalTokens=${step.usage.totalTokens ?? 0}`,
    );
  }

  private recordToolResultMetrics({
    step,
    toolMetricKeys,
    modelAttributes,
  }: {
    step: StepResult<ToolSet>;
    toolMetricKeys: ToolMetricKeys;
    modelAttributes: { model: string };
  }): void {
    for (const part of step.content) {
      if (part.type !== 'tool-result' && part.type !== 'tool-error') {
        continue;
      }

      const succeeded =
        part.type === 'tool-result' && isToolOutputSuccessful(part.output);

      const attributes = {
        ...modelAttributes,
        tool: getToolMetricName(resolveToolName(part)),
      };

      this.metricsService.incrementCounterBy({
        key: succeeded ? toolMetricKeys.succeeded : toolMetricKeys.failed,
        amount: 1,
        attributes,
      });

      this.metricsService.recordHistogram({
        key: toolMetricKeys.outputTokens,
        value: estimateToolOutputTokens(
          part.type === 'tool-result' ? part.output : part.error,
        ),
        unit: 'token',
        attributes,
        bucketBoundaries: TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES,
      });
    }
  }
}
