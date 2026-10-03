import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateText,
  jsonSchema,
  type LanguageModelUsage,
  type ModelMessage,
  Output,
  isStepCount,
  type StepResult,
  type ToolSet,
} from 'ai';
import { type RunAgentMessage } from 'twenty-shared/application';
import {
  AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID,
  PROPOSE_TOOL_CALL_TOOL_NAME,
} from 'twenty-shared/ai';
import { type ActorMetadata } from 'twenty-shared/types';
import {
  isDefined,
  isNonEmptyArray,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-execution-duration-ms-bucket-boundaries.constant';
import { TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES } from 'src/engine/core-modules/metrics/constants/tool-output-tokens-bucket-boundaries.constant';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import {
  createExecuteToolTool,
  createLearnToolsTool,
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { buildToolCatalogSection } from 'src/engine/core-modules/tool-provider/utils/build-tool-catalog-section.util';
import { estimateToolOutputTokens } from 'src/engine/core-modules/tool-provider/utils/estimate-tool-output-tokens.util';
import { getToolMetricName } from 'src/engine/core-modules/tool-provider/utils/get-tool-metric-name.util';
import { isToolOutputSuccessful } from 'src/engine/core-modules/tool-provider/utils/is-tool-output-successful.util';
import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/open-ended-agent-registry-tool-categories.const';
import { WORKFLOW_AGENT_EXCLUDED_TOOL_NAMES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/workflow-agent-excluded-tool-names.const';
import { WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/workflow-agent-registry-tool-categories.const';
import { type PausingToolCompletionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-completion-context.type';
import { resolveProposedToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/resolve-proposed-tool-call.util';
import { RunAgentAttachmentService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/run-agent-attachment.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { type AgentToolLoadingStrategy } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-tool-loading-strategy.type';
import { assertAgentResponseFormatHasOutputFieldsOrThrow } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/assert-agent-response-format-has-output-fields-or-throw.util';
import { buildAgentRolePermissionConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-role-permission-config.util';
import { buildStrictAgentResponseSchema } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-strict-agent-response-schema.util';
import { endsOnPausingToolCall } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/ends-on-pausing-tool-call.util';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { STRUCTURED_OUTPUT_SYSTEM_PROMPT } from 'src/engine/metadata-modules/ai/ai-agent/constants/structured-output-system-prompt.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertDollarsToCreditsMicro } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-credits-micro.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import {
  extractCacheCreationTokens,
  extractCacheCreationTokensFromSteps,
} from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { mergeLanguageModelUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/merge-language-model-usage.util';
import { getCallLevelProviderOptions } from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import { createProposeToolCallTool } from 'src/engine/metadata-modules/ai/ai-chat/tools/propose-tool-call.tool';
import { buildAiTelemetry } from 'src/engine/metadata-modules/ai/ai-models/utils/build-ai-telemetry.util';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { NativeToolBinderService } from 'src/engine/metadata-modules/ai/ai-models/services/native-tool-binder.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

const buildUnavailableToolOutput = (toolName: string): ToolOutput => ({
  success: false,
  message: `Tool "${toolName}" is not available`,
  error: `Tool "${toolName}" is not available to this agent.`,
});

type ProposableTools = {
  findTool: (toolName: string) => Promise<ToolIndexEntry | undefined>;
  executeTool: PausingToolCompletionContext['executeTool'];
};

const EMPTY_USAGE: LanguageModelUsage = {
  inputTokens: 0,
  outputTokens: 0,
  totalTokens: 0,
  inputTokenDetails: {
    noCacheTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  },
  outputTokenDetails: {
    textTokens: 0,
    reasoningTokens: 0,
  },
};

// workflow registry tools are excluded to avoid circular dependencies and recursive workflow execution
@Injectable()
export class AgentAsyncExecutorService {
  private readonly logger = new Logger(AgentAsyncExecutorService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly nativeToolBinder: NativeToolBinderService,
    private readonly aiBillingService: AiBillingService,
    private readonly metricsService: MetricsService,
    private readonly runAgentAttachmentService: RunAgentAttachmentService,
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  private async getAgentRoleId(
    agentId: string,
    workspaceId: string,
  ): Promise<string | undefined> {
    const roleTarget = await this.roleTargetRepository.findOne(workspaceId, {
      where: {
        agentId,
      },
      select: ['roleId'],
    });

    return roleTarget?.roleId;
  }

  private resolveUserIdentity(authContext?: WorkspaceAuthContext): {
    userId?: string;
    userWorkspaceId?: string;
  } {
    if (isDefined(authContext) && isUserAuthContext(authContext)) {
      return {
        userId: authContext.user.id,
        userWorkspaceId: authContext.userWorkspaceId,
      };
    }

    return {};
  }

  // preloading the few granted object schemas saves the model a learn_tools round trip
  private async buildPreloadedRegistryTools({
    agent,
    agentRoleId,
    runAsRoleId,
    authContext,
    actorContext,
  }: {
    agent: AgentEntity;
    agentRoleId: string;
    runAsRoleId?: string;
    authContext?: WorkspaceAuthContext;
    actorContext?: ActorMetadata;
  }): Promise<{ tools: ToolSet; proposableTools: ProposableTools }> {
    const { userId, userWorkspaceId } = this.resolveUserIdentity(authContext);

    const toolProviderContext: ToolProviderContext = {
      workspaceId: agent.workspaceId,
      roleId: agentRoleId,
      rolePermissionConfig: buildAgentRolePermissionConfig({
        agentRoleId,
        runAsRoleId,
      }),
      requireExplicitObjectGrants: true,
      authContext,
      actorContext,
      userId,
      userWorkspaceId,
    };

    const tools = await this.toolRegistry.getToolsByCategories(
      toolProviderContext,
      {
        categories: WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES,
        excludeTools: [
          ...OUTPUT_NAVIGATION_TOOL_NAMES,
          ...WORKFLOW_AGENT_EXCLUDED_TOOL_NAMES,
        ],
        wrapWithErrorContext: false,
      },
    );

    const toolContext: ToolContext = {
      workspaceId: agent.workspaceId,
      roleId: agentRoleId,
      rolePermissionConfig: toolProviderContext.rolePermissionConfig,
      authContext,
      actorContext,
      userId,
      userWorkspaceId,
    };

    return {
      tools,
      proposableTools: {
        findTool: async (toolName) =>
          Object.prototype.hasOwnProperty.call(tools, toolName)
            ? this.toolRegistry.findCatalogEntry(toolName, toolContext)
            : undefined,
        // the context lacks the explicit grants the preloaded tools were built with, so reads stay within those tools
        executeTool: ({ toolName, args }) =>
          Object.prototype.hasOwnProperty.call(tools, toolName)
            ? this.toolRegistry.resolveAndExecute(toolName, args, toolContext)
            : Promise.resolve(buildUnavailableToolOutput(toolName)),
      },
    };
  }

  // open-ended agents have broad access, so preloading would ship every schema: expose a compact catalog plus
  // learn_tools / execute_tool instead, scoped by composed role permissions rather than explicit grants only
  private async buildLazyRegistryTools({
    agent,
    agentRoleId,
    runAsRoleId,
    authContext,
    actorContext,
  }: {
    agent: AgentEntity;
    agentRoleId: string;
    runAsRoleId?: string;
    authContext?: WorkspaceAuthContext;
    actorContext?: ActorMetadata;
  }): Promise<{
    tools: ToolSet;
    catalogSection: string;
    proposableTools: ProposableTools;
  }> {
    const { userId, userWorkspaceId } = this.resolveUserIdentity(authContext);

    const rolePermissionConfig = isDefined(runAsRoleId)
      ? buildAgentRolePermissionConfig({ agentRoleId, runAsRoleId })
      : undefined;

    const toolContext: ToolContext = {
      workspaceId: agent.workspaceId,
      roleId: agentRoleId,
      rolePermissionConfig,
      authContext,
      actorContext,
      userId,
      userWorkspaceId,
    };

    const fullCatalog = await this.toolRegistry.buildToolIndex(
      agent.workspaceId,
      agentRoleId,
      { userId, userWorkspaceId, rolePermissionConfig },
    );

    const allowedCategories = new Set(
      OPEN_ENDED_AGENT_REGISTRY_TOOL_CATEGORIES,
    );
    const excludedToolNames = new Set<string>([
      ...OUTPUT_NAVIGATION_TOOL_NAMES,
      ...WORKFLOW_AGENT_EXCLUDED_TOOL_NAMES,
    ]);

    const catalog = fullCatalog.filter(
      (entry) =>
        allowedCategories.has(entry.category) &&
        !excludedToolNames.has(entry.name),
    );

    // meta-tools are limited to the shown catalog, checked at call time so a tool added later stays unreachable (recursion guard)
    const allowedToolNames = new Set(catalog.map((entry) => entry.name));
    const isToolAllowed = (toolName: string): boolean =>
      allowedToolNames.has(toolName);

    const tools: ToolSet = {
      [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(
        this.toolRegistry,
        toolContext,
        { isToolAllowed, spillLargeOutput: true },
      ),
      [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(
        this.toolRegistry,
        toolContext,
        { isToolAllowed, compactOutput: true, spillLargeOutput: true },
      ),
    };

    return {
      tools,
      catalogSection: buildToolCatalogSection(catalog, []),
      proposableTools: {
        findTool: async (toolName) =>
          catalog.find((toolIndexEntry) => toolIndexEntry.name === toolName),
        executeTool: ({ toolName, args }) =>
          isToolAllowed(toolName)
            ? this.toolRegistry.resolveAndExecute(toolName, args, toolContext)
            : Promise.resolve(buildUnavailableToolOutput(toolName)),
      },
    };
  }

  async executeAgent({
    agent,
    messages,
    baseSystemPrompt,
    actorContext,
    authContext,
    workspaceId,
    userWorkspaceId,
    runAsRoleId,
    operationType = UsageOperationType.AI_WORKFLOW_TOKEN,
    toolLoadingStrategy = 'preload',
    priorModelMessages = [],
    pausingTools = {},
    canProposeToolCalls = false,
  }: {
    agent: AgentEntity | null;
    messages: RunAgentMessage[];
    // a continued conversation, with the tool calls and results plain run messages cannot carry
    priorModelMessages?: ModelMessage[];
    pausingTools?: ToolSet;
    // offers propose_tool_call over the registry tools the agent can call itself
    canProposeToolCalls?: boolean;
    baseSystemPrompt: string;
    actorContext?: ActorMetadata;
    authContext?: WorkspaceAuthContext;
    workspaceId: string;
    userWorkspaceId?: string | null;
    runAsRoleId?: string;
    operationType?: UsageOperationType;
    toolLoadingStrategy?: AgentToolLoadingStrategy;
  }): Promise<AgentExecutionResult> {
    if (!isNonEmptyArray(messages) && !isNonEmptyArray(priorModelMessages)) {
      throw new AiException(
        'Provide at least one message to run an agent',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    assertAgentResponseFormatHasOutputFieldsOrThrow(agent?.responseFormat);

    await this.aiBillingService.assertAiExecutionAllowed({
      workspaceId,
      operationType,
      spenders: { userWorkspaceId, agentId: agent?.id },
    });

    let accumulatedUsage: LanguageModelUsage = EMPTY_USAGE;
    let cacheCreationTokens = 0;
    let nativeWebSearchCallCount = 0;
    let executionSteps: StepResult<ToolSet>[] = [];
    let resolvedModelId: string | undefined;

    try {
      const workspace = await this.workspaceRepository.findOneBy({
        id: workspaceId,
      });

      if (isDefined(agent)) {
        this.aiModelRegistryService.validateModelAvailability(agent.modelId);
      }

      const registeredModel =
        await this.aiModelRegistryService.resolveModelForAgent(
          agent,
          workspace ?? undefined,
        );

      resolvedModelId = registeredModel.modelId;

      let tools: ToolSet = {};
      let toolCatalogSection = '';
      let offeredPausingTools: ToolSet = pausingTools;
      const providerOptions = getCallLevelProviderOptions({
        sdkPackage: registeredModel.sdkPackage,
        providerOptions:
          this.aiModelConfigService.getReasoningProviderOptions(
            registeredModel,
          ),
        promptCacheKey: agent?.id,
      });

      if (agent) {
        const agentRoleId = await this.getAgentRoleId(
          agent.id,
          agent.workspaceId,
        );

        const nativeModelToolOptions: NativeModelToolOptions = {
          webSearch: agent.modelConfiguration?.webSearch?.enabled === true,
          twitterSearch:
            agent.modelConfiguration?.twitterSearch?.enabled === true,
        };

        let registryTools: ToolSet = {};

        if (isDefined(agentRoleId)) {
          const registryToolset =
            toolLoadingStrategy === 'lazy'
              ? await this.buildLazyRegistryTools({
                  agent,
                  agentRoleId,
                  runAsRoleId,
                  authContext,
                  actorContext,
                })
              : {
                  ...(await this.buildPreloadedRegistryTools({
                    agent,
                    agentRoleId,
                    runAsRoleId,
                    authContext,
                    actorContext,
                  })),
                  catalogSection: '',
                };

          registryTools = registryToolset.tools;
          toolCatalogSection = registryToolset.catalogSection;

          if (canProposeToolCalls) {
            const { findTool, executeTool } = registryToolset.proposableTools;

            offeredPausingTools = {
              ...offeredPausingTools,
              [PROPOSE_TOOL_CALL_TOOL_NAME]: createProposeToolCallTool({
                resolveProposal: (input) =>
                  resolveProposedToolCall({ input, findTool, executeTool }),
              }),
            };
          }
        }

        const nativeTools = this.nativeToolBinder.bind(
          registeredModel,
          nativeModelToolOptions,
        );

        tools = {
          ...registryTools,
          ...nativeTools,
        };
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      let hasNoMoreAvailableCredits = false;

      const modelMessages =
        await this.runAgentAttachmentService.buildModelMessagesOrThrow({
          messages,
          workspaceId,
          modalities: this.aiModelRegistryService.getModelConfig(
            registeredModel.modelId,
          )?.modalities,
        });

      const offeredToolNames = Object.keys(offeredPausingTools);

      const textResponse = await generateText({
        instructions: `${baseSystemPrompt}\n\n${agent ? tipTapDocumentToMarkdown(agent.prompt) : ''}${toolCatalogSection}`,
        tools: { ...tools, ...offeredPausingTools },
        model: registeredModel.model,
        messages: [...priorModelMessages, ...modelMessages],
        stopWhen: (step) =>
          isStepCount(AGENT_CONFIG.MAX_STEPS)(step) ||
          endsOnPausingToolCall({ steps: step.steps, offeredToolNames }) ||
          hasNoMoreAvailableCredits,
        providerOptions,
        ...buildAiTelemetry({
          functionId: 'agent-execution',
          workspaceId,
          userWorkspaceId,
          agentId: agent?.id,
        }),
        onToolExecutionEnd: (event) => {
          this.metricsService.recordHistogram({
            key: MetricsKeys.WorkflowAgentToolExecutionDurationMs,
            value: event.toolExecutionMs,
            unit: 'ms',
            attributes: {
              model: registeredModel.modelId,
              tool: getToolMetricName(event.toolCall.toolName),
            },
            bucketBoundaries: TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES,
          });
        },
        onStepEnd: async (step) => {
          const { hasNoMoreAvailableCredits: stepHasNoMoreAvailableCredits } =
            await this.aiBillingService.decrementAndCheckAvailableCredits({
              modelId: registeredModel.modelId,
              billingInput: {
                usage: step.usage,
                cacheCreationTokens: extractCacheCreationTokens(
                  step.providerMetadata,
                ),
              },
              workspaceId,
              operationType,
              spenders: { userWorkspaceId, agentId: agent?.id },
            });

          if (stepHasNoMoreAvailableCredits) {
            hasNoMoreAvailableCredits = true;
          }

          for (const part of step.content) {
            if (part.type !== 'tool-result' && part.type !== 'tool-error') {
              continue;
            }

            const succeeded =
              part.type === 'tool-result' &&
              isToolOutputSuccessful(part.output);

            const toolAttributes = {
              model: registeredModel.modelId,
              tool: getToolMetricName(part.toolName),
            };

            this.metricsService.incrementCounterBy({
              key: succeeded
                ? MetricsKeys.WorkflowAgentToolExecutionSucceeded
                : MetricsKeys.WorkflowAgentToolExecutionFailed,
              amount: 1,
              attributes: toolAttributes,
            });

            this.metricsService.recordHistogram({
              key: MetricsKeys.WorkflowAgentToolOutputTokens,
              value: estimateToolOutputTokens(
                part.type === 'tool-result' ? part.output : part.error,
              ),
              unit: 'token',
              attributes: toolAttributes,
              bucketBoundaries: TOOL_OUTPUT_TOKENS_BUCKET_BOUNDARIES,
            });
          }
        },
        repairToolCall: async ({
          toolCall,
          tools: toolsForRepair,
          inputSchema,
          error,
        }) => {
          return repairToolCall({
            toolCall,
            tools: toolsForRepair,
            inputSchema,
            error,
            model: registeredModel.model,
          });
        },
      });

      accumulatedUsage = textResponse.usage;
      cacheCreationTokens = extractCacheCreationTokensFromSteps(
        textResponse.steps,
      );
      nativeWebSearchCallCount = countNativeWebSearchCallsFromSteps(
        textResponse.steps,
      );
      executionSteps = textResponse.steps;

      const agentSchema =
        agent?.responseFormat?.type === 'json'
          ? agent.responseFormat.schema
          : undefined;

      let result: object = { response: textResponse.text };

      const endsOnPausingTool = endsOnPausingToolCall({
        steps: textResponse.steps,
        offeredToolNames,
      });

      if (isDefined(agentSchema) && !endsOnPausingTool) {
        const structuredResult = await generateText({
          instructions: STRUCTURED_OUTPUT_SYSTEM_PROMPT,
          model: registeredModel.model,
          prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

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
            const { hasNoMoreAvailableCredits: stepHasNoMoreAvailableCredits } =
              await this.aiBillingService.decrementAndCheckAvailableCredits({
                modelId: registeredModel.modelId,
                billingInput: {
                  usage: step.usage,
                  cacheCreationTokens: extractCacheCreationTokens(
                    step.providerMetadata,
                  ),
                },
                workspaceId,
                operationType,
                spenders: { userWorkspaceId, agentId: agent?.id },
              });

            if (stepHasNoMoreAvailableCredits) {
              hasNoMoreAvailableCredits = true;
            }
          },
        });

        accumulatedUsage = mergeLanguageModelUsage(
          textResponse.usage,
          structuredResult.usage,
        );
        executionSteps = [...textResponse.steps, ...structuredResult.steps];

        if (structuredResult.output == null) {
          throw new AiException(
            'Failed to generate structured output from execution results',
            AiExceptionCode.AGENT_EXECUTION_FAILED,
          );
        }

        result = structuredResult.output as object;
      }

      const tokenCostInDollars = this.aiBillingService.calculateStepsCost(
        registeredModel.modelId,
        executionSteps,
      );
      const totalCostInDollars =
        tokenCostInDollars +
        nativeWebSearchCallCount * NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS;
      const creditsUsedMicro = convertDollarsToCreditsMicro(totalCostInDollars);

      return {
        result,
        usage: accumulatedUsage,
        cacheCreationTokens,
        nativeWebSearchCallCount,
        hasNoMoreAvailableCredits,
        // out of credits fails the execution even if it asked something, so it is never left waiting for an answer
        isPaused: endsOnPausingTool && !hasNoMoreAvailableCredits,
        steps: executionSteps,
        modelId: resolvedModelId,
        totalCostInDollars,
        creditsUsedMicro,
      };
    } catch (error) {
      if (error instanceof AiException) {
        throw error;
      }
      throw new AiException(
        error instanceof Error ? error.message : 'Agent execution failed',
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
    } finally {
      const modelId =
        resolvedModelId ??
        agent?.modelId ??
        AUTO_SELECT_WORKSPACE_DEFAULT_MODEL_ID;
      // pricing an unresolved model id would throw over the original error
      const costInDollars = isDefined(resolvedModelId)
        ? this.aiBillingService.calculateStepsCost(
            resolvedModelId,
            executionSteps,
          )
        : 0;
      const creditsUsedMicro = convertDollarsToCreditsMicro(costInDollars);
      const totalTokens =
        (accumulatedUsage.inputTokens ?? 0) +
        (accumulatedUsage.outputTokens ?? 0);

      void this.aiBillingService.emitAiTokenUsageEvent(
        workspaceId,
        creditsUsedMicro,
        totalTokens,
        modelId,
        operationType,
        agent?.id ?? null,
        userWorkspaceId,
      );

      void this.aiBillingService.billNativeWebSearchUsage(
        nativeWebSearchCallCount,
        workspaceId,
        userWorkspaceId,
      );
    }
  }
}
