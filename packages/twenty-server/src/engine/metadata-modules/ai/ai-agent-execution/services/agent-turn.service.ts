import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  convertToModelMessages,
  generateText,
  jsonSchema,
  Output,
  readUIMessageStream,
  type TextStreamPart,
  toUIMessageStream,
  type ToolSet,
} from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import {
  type ExtendedUIMessage,
  type ExtendedUIMessagePart,
} from 'twenty-shared/ai';
import {
  isDefined,
  isNonEmptyArray,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AGENT_RUN_EXCLUDED_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-excluded-tool-names.const';
import { OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/open-ended-agent-registry-tool-categories.const';
import { PRELOADED_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/preloaded-agent-registry-tool-categories.const';
import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/ends-on-pausing-tool-call.util';
import {
  type AgentStepLoop,
  type AgentStepLoopInput,
  AgentStepLoopService,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-step-loop.service';
import {
  type AgentRegistryAccess,
  type AgentToolset,
  type AgentToolsetInput,
  AgentToolsetService,
} from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-toolset.service';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentToolLoadingStrategy } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-tool-loading-strategy.type';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';
import { buildStrictAgentResponseSchema } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-strict-agent-response-schema.util';
import { getCallLevelProviderOptions } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/provider-options.util';
import { replaceUnsupportedFileParts } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/replace-unsupported-file-parts.util';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { STRUCTURED_OUTPUT_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/structured-output-system-prompt.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { mergeLanguageModelUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/merge-language-model-usage.util';
import { formatErrorWithCause } from 'src/engine/metadata-modules/ai/ai-chat/utils/format-error-with-cause.util';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import {
  AiModelRegistryService,
  type RegisteredAiModel,
} from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { type AiModelConfig } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-config.type';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { getNativeModelCapabilities } from 'src/engine/metadata-modules/ai/ai-models/utils/get-native-model-capabilities.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export type AgentTurnContext = Pick<
  AgentStepLoopInput,
  'systemPrompt' | 'contextMessages' | 'messages'
>;

export type AgentTurnInput = Omit<
  AgentStepLoopInput,
  | 'registeredModel'
  | 'modelConfig'
  | 'systemPrompt'
  | 'contextMessages'
  | 'messages'
  | 'tools'
  | 'offeredPausingToolNames'
  | 'providerOptions'
> & {
  workspace?: WorkspaceEntity;
  // the workspace default when absent
  modelId?: string;
  // the model's own native tools when nativeToolOptions is absent
  toolset: Omit<AgentToolsetInput, 'registeredModel' | 'nativeToolOptions'> & {
    nativeToolOptions?: NativeModelToolOptions;
  };
  buildContext: (turn: {
    registeredModel: RegisteredAiModel;
    modelConfig: AiModelConfig;
    toolset: AgentToolset;
  }) => Promise<AgentTurnContext>;
  promptCacheKey?: string;
  shouldIncludeReasoningSummary?: boolean;
};

export type AgentTurn = AgentStepLoop & {
  registeredModel: RegisteredAiModel;
  modelConfig: AiModelConfig;
  toolset: AgentToolset;
};

export type AgentRunTurnInput = {
  agent: AgentEntity | null;
  messages: RunAgentMessage[];
  // a continued conversation, with the tool calls and results plain run messages cannot carry
  priorMessages?: ExtendedUIMessage[];
  pausingTools?: ToolSet;
  canAskHumans?: boolean;
  baseSystemPrompt: string;
  workspaceId: string;
  executionContext: AgentRunExecutionContext;
  additionalExcludedToolNames?: readonly string[];
  toolLoadingStrategy?: AgentToolLoadingStrategy;
};

// One agent turn, the same for a chat and a background run: the model, its tools, its context and the
// step loop. Callers differ only in what they put in the context and how they read the stream
@Injectable()
export class AgentTurnService {
  private readonly logger = new Logger(AgentTurnService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly aiBillingService: AiBillingService,
    private readonly aiAgentRoleService: AiAgentRoleService,
    private readonly agentToolsetService: AgentToolsetService,
    private readonly agentStepLoopService: AgentStepLoopService,
    private readonly runAgentAttachmentService: RunAgentAttachmentService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async start({
    workspace,
    modelId,
    toolset: toolsetInput,
    buildContext,
    promptCacheKey,
    shouldIncludeReasoningSummary = false,
    ...loopInput
  }: AgentTurnInput): Promise<AgentTurn> {
    if (isDefined(modelId)) {
      this.aiModelRegistryService.validateModelAvailability(modelId);
    }

    const registeredModel = this.aiModelRegistryService.resolveModelForAgent(
      isDefined(modelId) ? { modelId } : null,
      workspace,
    );
    const modelConfig = this.aiModelRegistryService.getEffectiveModelConfig(
      registeredModel.modelId,
    );
    const nativeCapabilities = getNativeModelCapabilities(
      registeredModel.sdkPackage,
    );

    const toolset = await this.agentToolsetService.build({
      ...toolsetInput,
      registeredModel,
      nativeToolOptions: toolsetInput.nativeToolOptions ?? {
        webSearch: nativeCapabilities?.webSearch === true,
        twitterSearch: nativeCapabilities?.twitterSearch === true,
      },
    });

    const { systemPrompt, contextMessages, messages } = await buildContext({
      registeredModel,
      modelConfig,
      toolset,
    });

    this.logger.log(
      `Starting ${loopInput.metricsScope} turn with model ${registeredModel.modelId}, ${Object.keys(toolset.tools).length} tools`,
    );

    const stepLoop = this.agentStepLoopService.start({
      ...loopInput,
      registeredModel,
      modelConfig,
      systemPrompt,
      contextMessages,
      messages,
      tools: toolset.tools,
      offeredPausingToolNames: toolset.offeredPausingToolNames,
      providerOptions: getCallLevelProviderOptions({
        sdkPackage: registeredModel.sdkPackage,
        providerOptions: this.aiModelConfigService.getReasoningProviderOptions(
          registeredModel,
          { shouldIncludeReasoningSummary },
        ),
        promptCacheKey,
      }),
    });

    return { ...stepLoop, registeredModel, modelConfig, toolset };
  }

  // a configured agent's turn run to its end, as a background run needs it
  async runAgentTurn({
    agent,
    messages,
    baseSystemPrompt,
    workspaceId,
    executionContext,
    additionalExcludedToolNames = [],
    toolLoadingStrategy = 'preload',
    priorMessages = [],
    pausingTools = {},
    canAskHumans = false,
  }: AgentRunTurnInput): Promise<AgentExecutionResult> {
    if (!isNonEmptyArray(messages) && !isNonEmptyArray(priorMessages)) {
      throw new AiException(
        'Provide at least one message to run an agent',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    assertAgentResponseFormatHasOutputFieldsOrThrow(agent?.responseFormat);

    const { userWorkspaceId, usageOperationType } = executionContext;

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId,
      operationType: usageOperationType,
      spenders: { userWorkspaceId, agentId: agent?.id },
    });

    try {
      const workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });
      const billing = {
        workspaceId,
        operationType: usageOperationType,
        userWorkspaceId: userWorkspaceId ?? null,
        agentId: agent?.id ?? null,
      };
      const registryAccess = await this.buildAgentRegistryAccess({
        agent,
        executionContext,
        additionalExcludedToolNames,
        toolLoadingStrategy,
      });

      const turn = await this.start({
        workspace: workspace ?? undefined,
        modelId: agent?.modelId,
        toolset: {
          registryAccess,
          nativeToolOptions: {
            webSearch: agent?.modelConfiguration?.webSearch?.enabled === true,
            twitterSearch:
              agent?.modelConfiguration?.twitterSearch?.enabled === true,
          },
          canAskHumans,
          // a step without an agent has no tools of its own, so it may only propose emails
          canProposeEmails: !isDefined(agent),
          waitTools: pausingTools,
        },
        buildContext: async ({ modelConfig, toolset }) => ({
          systemPrompt: `${baseSystemPrompt}\n\n${agent ? tipTapDocumentToMarkdown(agent.prompt) : ''}${
            registryAccess.type === 'catalog'
              ? buildToolCatalogSection(toolset.toolCatalog, [])
              : ''
          }`,
          messages: [
            ...(await convertToModelMessages(
              replaceUnsupportedFileParts(
                priorMessages,
                modelConfig.modalities,
                false,
              ),
            )),
            ...(await this.runAgentAttachmentService.buildModelMessagesOrThrow({
              messages,
              workspaceId,
              modalities: modelConfig.modalities,
            })),
          ],
        }),
        promptCacheKey: agent?.id,
        billing,
        telemetry: {
          functionId: 'agent-execution',
          workspaceId,
          userWorkspaceId,
          agentId: agent?.id,
        },
        // nobody resends a background run, so a provider error after streaming started is retried here
        streamRetries: 2,
        metricsScope: 'agent',
      });

      const replyParts = await this.readReplyParts(turn);

      const [text, loopUsage, loopSteps] = await Promise.all([
        turn.stream.text,
        turn.stream.usage,
        turn.stream.steps,
      ]);
      const { registeredModel, toolset } = turn;
      const isPaused = endsOnPausingToolCall({
        steps: loopSteps,
        offeredToolNames: toolset.offeredPausingToolNames,
      });
      const agentSchema =
        agent?.responseFormat?.type === 'json'
          ? agent.responseFormat.schema
          : undefined;

      let hasNoMoreAvailableCredits = turn.hasNoMoreAvailableCredits();
      let result: object = { response: text };
      let usage = loopUsage;
      let steps = loopSteps;

      if (isDefined(agentSchema) && !isPaused) {
        const structuredResult = await generateText({
          instructions: STRUCTURED_OUTPUT_SYSTEM_PROMPT,
          model: registeredModel.model,
          prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${text}

                 Please generate the structured output based on the execution results and context above.`,
          output: Output.object({
            schema: jsonSchema(buildStrictAgentResponseSchema(agentSchema)),
          }),
          providerOptions: getCallLevelProviderOptions({
            sdkPackage: registeredModel.sdkPackage,
            providerOptions: undefined,
            promptCacheKey: agent?.id,
          }),
          ...buildAiTelemetry({
            functionId: 'agent-structured-output',
            workspaceId,
            userWorkspaceId,
            agentId: agent?.id,
          }),
          onStepEnd: async (step) => {
            if (
              await this.agentStepLoopService.chargeStep({
                modelId: registeredModel.modelId,
                billing,
                step,
              })
            ) {
              hasNoMoreAvailableCredits = true;
            }
          },
        });

        void this.aiBillingService.recordStepsUsage({
          modelId: registeredModel.modelId,
          steps: structuredResult.steps,
          workspaceId,
          operationType: usageOperationType,
          spenders: { userWorkspaceId, agentId: agent?.id },
        });

        usage = mergeLanguageModelUsage(usage, structuredResult.usage);
        steps = [...steps, ...structuredResult.steps];

        if (structuredResult.output == null) {
          throw new AiException(
            'Failed to generate structured output from execution results',
            AiExceptionCode.AGENT_EXECUTION_FAILED,
          );
        }

        result = structuredResult.output as object;
      }

      const nativeWebSearchCallCount =
        countNativeWebSearchCallsFromSteps(steps);
      const totalCostInDollars =
        this.aiBillingService.calculateStepsCost(
          registeredModel.modelId,
          steps,
        ) +
        nativeWebSearchCallCount * NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS;

      return {
        result,
        usage,
        cacheCreationTokens: extractCacheCreationTokensFromSteps(steps),
        nativeWebSearchCallCount,
        hasNoMoreAvailableCredits,
        // out of credits fails the execution even if it asked something, so it is never left waiting for an answer
        isPaused: isPaused && !hasNoMoreAvailableCredits,
        steps,
        replyParts,
        modelId: registeredModel.modelId,
        totalCostInDollars,
        creditsUsedMicro: convertDollarsToCreditsMicro(totalCostInDollars),
        turnUsage: this.aiBillingService.calculateStepsTurnUsage(
          registeredModel.modelId,
          steps,
        ),
      };
    } catch (error) {
      if (error instanceof AiException) {
        throw error;
      }

      throw new AiException(
        error instanceof Error ? error.message : 'Agent execution failed',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }

  private async buildAgentRegistryAccess({
    agent,
    executionContext: { authContext, actorContext, agentRunRoleIds },
    additionalExcludedToolNames,
    toolLoadingStrategy,
  }: Pick<
    Required<AgentRunTurnInput>,
    | 'agent'
    | 'executionContext'
    | 'additionalExcludedToolNames'
    | 'toolLoadingStrategy'
  >): Promise<AgentRegistryAccess> {
    if (!isDefined(agent)) {
      return { type: 'none' };
    }

    const agentRoleId = await this.aiAgentRoleService.findAgentRoleId({
      workspaceId: agent.workspaceId,
      agentId: agent.id,
    });

    if (!isDefined(agentRoleId)) {
      return { type: 'none' };
    }

    const toolContext: ToolContext = {
      workspaceId: agent.workspaceId,
      roleId: agentRoleId,
      authContext,
      actorContext,
      rolePermissionConfig: buildAgentRolePermissionConfig({
        agentRoleId,
        agentRunRoleIds,
      }),
      ...(isDefined(authContext) && isUserAuthContext(authContext)
        ? {
            userId: authContext.user.id,
            userWorkspaceId: authContext.userWorkspaceId,
          }
        : {}),
    };
    const excludedToolNames = [
      ...OUTPUT_NAVIGATION_TOOL_NAMES,
      ...AGENT_RUN_EXCLUDED_TOOL_NAMES,
      ...additionalExcludedToolNames,
    ];

    // open-ended agents reach too many tools to send them all, so they get a catalog and the meta tools;
    // the few granted object tools are cheaper sent with the turn than learned
    return toolLoadingStrategy === 'lazy'
      ? {
          type: 'catalog',
          toolContext,
          categories: OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES,
          excludedToolNames,
        }
      : {
          type: 'granted',
          toolContext,
          categories: PRELOADED_AGENT_REGISTRY_TOOL_CATEGORIES,
          excludedToolNames,
        };
  }

  // the reply is read the way chat reads its stream, so both save the same parts
  private async readReplyParts(
    turn: AgentTurn,
  ): Promise<ExtendedUIMessagePart[]> {
    let replyParts: ExtendedUIMessagePart[] = [];
    let streamError: unknown;

    for await (const message of readUIMessageStream<ExtendedUIMessage>({
      stream: toUIMessageStream({
        // a retried provider error never reaches this stream, so an error part here fails the run
        stream: turn.stream.stream.pipeThrough(
          new TransformStream<TextStreamPart<ToolSet>, TextStreamPart<ToolSet>>(
            {
              transform: (part, controller) => {
                if (part.type === 'error') {
                  streamError ??= part.error;
                }

                controller.enqueue(part);
              },
            },
          ),
        ),
        sendReasoning: true,
        onError: formatErrorWithCause,
      }),
    })) {
      replyParts = message.parts;
    }

    if (isDefined(streamError)) {
      throw streamError;
    }

    return replyParts;
  }
}
