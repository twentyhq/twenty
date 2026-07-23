import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateText,
  jsonSchema,
  type LanguageModelUsage,
  Output,
  stepCountIs,
  type StepResult,
  type ToolSet,
} from 'ai';
import { AUTO_SELECT_SMART_MODEL_ID } from 'twenty-shared/constants';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
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
import { estimateToolOutputTokens } from 'src/engine/core-modules/tool-provider/utils/estimate-tool-output-tokens.util';
import { getToolMetricName } from 'src/engine/core-modules/tool-provider/utils/get-tool-metric-name.util';
import { isToolOutputSuccessful } from 'src/engine/core-modules/tool-provider/utils/is-tool-output-successful.util';
import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';
import { OUTPUT_NAVIGATION_TOOL_NAMES } from 'src/engine/core-modules/tool/tools/output-navigation-tool/constants/output-navigation-tool-names.constant';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/workflow-agent-registry-tool-categories.const';
import { AgentToolPreloadService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-tool-preload.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { extractExecutedRegistryToolNames } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/extract-executed-registry-tool-names.util';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { WORKFLOW_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { buildWorkflowAgentToolCatalogSection } from 'src/engine/metadata-modules/ai/ai-agent/utils/build-workflow-agent-tool-catalog-section.util';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS } from 'src/engine/metadata-modules/ai/ai-billing/constants/native-web-search-cost-per-call-dollars';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { convertDollarsToBillingCredits } from 'src/engine/metadata-modules/ai/ai-billing/utils/convert-dollars-to-billing-credits.util';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import {
  extractCacheCreationTokens,
  extractCacheCreationTokensFromSteps,
} from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { mergeLanguageModelUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/merge-language-model-usage.util';
import { getCallLevelProviderOptions } from 'src/engine/metadata-modules/ai/ai-chat/utils/provider-options.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { NativeToolBinderService } from 'src/engine/metadata-modules/ai/ai-models/services/native-tool-binder.service';
import { type NativeModelToolOptions } from 'src/engine/metadata-modules/ai/ai-models/types/native-model-tool-options.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

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

// Agent execution within workflows uses registry tools plus native model tools.
// Workflow registry tools are intentionally excluded to avoid circular
// dependencies and recursive workflow execution.
@Injectable()
export class AgentAsyncExecutorService {
  private readonly logger = new Logger(AgentAsyncExecutorService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly aiModelConfigService: AiModelConfigService,
    private readonly toolRegistry: ToolRegistryService,
    private readonly nativeToolBinder: NativeToolBinderService,
    private readonly aiBillingService: AiBillingService,
    private readonly billingUsageService: BillingUsageService,
    private readonly metricsService: MetricsService,
    private readonly agentToolPreloadService: AgentToolPreloadService,
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

  async executeAgent({
    agent,
    userPrompt,
    actorContext,
    authContext,
    workspaceId,
    userWorkspaceId,
    operationType = UsageOperationType.AI_WORKFLOW_TOKEN,
  }: {
    agent: AgentEntity | null;
    userPrompt: string;
    actorContext?: ActorMetadata;
    authContext?: WorkspaceAuthContext;
    workspaceId: string;
    userWorkspaceId?: string | null;
    operationType?: UsageOperationType;
  }): Promise<AgentExecutionResult> {
    await this.billingUsageService.hasAvailableCreditsOrThrow(workspaceId);

    let accumulatedUsage: LanguageModelUsage = EMPTY_USAGE;
    let cacheCreationTokens = 0;
    let nativeWebSearchCallCount = 0;
    let executionSteps: StepResult<ToolSet>[] = [];

    try {
      if (agent) {
        const workspace = await this.workspaceRepository.findOneBy({
          id: agent.workspaceId,
        });

        if (workspace) {
          this.aiModelRegistryService.validateModelAvailability(
            agent.modelId,
            workspace,
          );
        }
      }

      const registeredModel =
        await this.aiModelRegistryService.resolveModelForAgent(agent);

      let tools: ToolSet = {};
      let systemPrompt = `${WORKFLOW_SYSTEM_PROMPTS.BASE}\n\n${
        agent ? agent.prompt : ''
      }`;
      // Registry tool names available this run, used after execution to record
      // which tools were actually called for the next run's preload set.
      let recordableToolNames: Set<string> | null = null;
      let providerOptions = getCallLevelProviderOptions({
        sdkPackage: registeredModel.sdkPackage,
        providerOptions: undefined,
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

        const nativeTools = this.nativeToolBinder.bind(
          registeredModel,
          nativeModelToolOptions,
        );

        let registryTools: ToolSet = {};

        // Workflow agent registry tools are scoped exclusively by the agent
        // permission-tab role. No role means no registry tools.
        //
        // Tools use progressive disclosure: the model sees a lightweight
        // catalog (names + descriptions) in the system prompt and pulls a
        // tool's input schema on demand via learn_tools/execute_tool. This
        // avoids eagerly serializing every CRUD schema for every object the
        // role can access, which otherwise dominates the prompt token cost.
        if (isDefined(agentRoleId)) {
          const userId =
            isDefined(authContext) && isUserAuthContext(authContext)
              ? authContext.user.id
              : undefined;
          const userWorkspaceId =
            isDefined(authContext) && isUserAuthContext(authContext)
              ? authContext.userWorkspaceId
              : undefined;

          const agentRolePermissionConfig: RolePermissionConfig = {
            unionOf: [agentRoleId],
          };

          const toolProviderContext: ToolProviderContext = {
            workspaceId: agent.workspaceId,
            roleId: agentRoleId,
            rolePermissionConfig: agentRolePermissionConfig,
            authContext,
            actorContext,
            userId,
            userWorkspaceId,
          };

          const toolContext: ToolContext = {
            workspaceId: agent.workspaceId,
            roleId: agentRoleId,
            authContext,
            actorContext,
            userId,
            userWorkspaceId,
          };

          const excludedToolNames = new Set<string>(
            OUTPUT_NAVIGATION_TOOL_NAMES,
          );

          const toolCatalog = (
            await this.toolRegistry.getCatalog(toolProviderContext, {
              categories: WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES,
            })
          ).filter((entry) => !excludedToolNames.has(entry.name));

          const catalogToolNames = new Set(
            toolCatalog.map((entry) => entry.name),
          );

          recordableToolNames = catalogToolNames;

          // Preload the schemas of tools this agent used in recent runs so the
          // common path skips the learn_tools round-trip. Names no longer in the
          // catalog (permissions or metadata changed) are dropped.
          const historicalToolNames =
            await this.agentToolPreloadService.getPreloadToolNames(agent);
          const preloadToolNames = historicalToolNames.filter((name) =>
            catalogToolNames.has(name),
          );

          const preloadedTools =
            preloadToolNames.length > 0
              ? await this.toolRegistry.getToolsByName(
                  preloadToolNames,
                  toolContext,
                  { compactOutput: true, spillLargeOutput: true },
                )
              : {};

          registryTools = {
            ...preloadedTools,
            [LEARN_TOOLS_TOOL_NAME]: createLearnToolsTool(
              this.toolRegistry,
              toolContext,
              excludedToolNames,
            ),
            [EXECUTE_TOOL_TOOL_NAME]: createExecuteToolTool(
              this.toolRegistry,
              toolContext,
              {
                excludeTools: excludedToolNames,
                compactOutput: true,
                spillLargeOutput: true,
              },
            ),
          };

          systemPrompt = `${systemPrompt}\n\n${buildWorkflowAgentToolCatalogSection(
            toolCatalog,
            Object.keys(preloadedTools),
          )}`;
        }

        tools = {
          ...registryTools,
          ...nativeTools,
        };

        providerOptions = getCallLevelProviderOptions({
          sdkPackage: registeredModel.sdkPackage,
          providerOptions:
            this.aiModelConfigService.getReasoningProviderOptions(
              registeredModel,
            ),
          promptCacheKey: agent?.id,
        });
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      let hasNoMoreAvailableCredits = false;

      const textResponse = await generateText({
        system: systemPrompt,
        tools,
        model: registeredModel.model,
        prompt: userPrompt,
        stopWhen: (step) =>
          stepCountIs(AGENT_CONFIG.MAX_STEPS)(step) ||
          hasNoMoreAvailableCredits,
        providerOptions,
        experimental_telemetry: AI_TELEMETRY_CONFIG,
        experimental_onToolCallFinish: (event) => {
          this.metricsService.recordHistogram({
            key: MetricsKeys.WorkflowAgentToolExecutionDurationMs,
            value: event.durationMs,
            unit: 'ms',
            attributes: {
              model: registeredModel.modelId,
              tool: getToolMetricName(resolveToolName(event.toolCall)),
            },
            bucketBoundaries: TOOL_EXECUTION_DURATION_MS_BUCKET_BOUNDARIES,
          });
        },
        onStepFinish: async (step) => {
          const { hasNoMoreAvailableCredits: stepHasNoMoreAvailableCredits } =
            await this.aiBillingService.decrementAndCheckAvailableCredits(
              registeredModel.modelId,
              {
                usage: step.usage,
                cacheCreationTokens: extractCacheCreationTokens(
                  step.providerMetadata,
                ),
              },
              workspaceId,
            );

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
              tool: getToolMetricName(resolveToolName(part)),
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
        experimental_repairToolCall: async ({
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

      if (agent && isDefined(recordableToolNames)) {
        try {
          await this.agentToolPreloadService.recordToolUsage(
            agent,
            extractExecutedRegistryToolNames(
              textResponse.steps,
              recordableToolNames,
            ),
          );
        } catch (error) {
          this.logger.warn(
            `Failed to record agent tool usage for preload: ${
              error instanceof Error ? error.message : String(error)
            }`,
          );
        }
      }

      const agentSchema =
        agent?.responseFormat?.type === 'json'
          ? agent.responseFormat.schema
          : undefined;

      let result: object = { response: textResponse.text };

      if (agentSchema) {
        const structuredResult = await generateText({
          system: WORKFLOW_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
          model: registeredModel.model,
          prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

                 Please generate the structured output based on the execution results and context above.`,
          output: Output.object({ schema: jsonSchema(agentSchema) }),
          providerOptions: getCallLevelProviderOptions({
            sdkPackage: registeredModel.sdkPackage,
            providerOptions: undefined,
            promptCacheKey: agent?.id,
          }),
          experimental_telemetry: AI_TELEMETRY_CONFIG,
          onStepFinish: async (step) => {
            const { hasNoMoreAvailableCredits: stepHasNoMoreAvailableCredits } =
              await this.aiBillingService.decrementAndCheckAvailableCredits(
                registeredModel.modelId,
                {
                  usage: step.usage,
                  cacheCreationTokens: extractCacheCreationTokens(
                    step.providerMetadata,
                  ),
                },
                workspaceId,
              );

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

      const resolvedModelId = registeredModel.modelId;
      const tokenCostInDollars = this.aiBillingService.calculateCost(
        resolvedModelId,
        { usage: accumulatedUsage, cacheCreationTokens },
      );
      const totalCostInDollars =
        tokenCostInDollars +
        nativeWebSearchCallCount * NATIVE_WEB_SEARCH_COST_PER_CALL_DOLLARS;
      const creditsUsedMicro = Math.round(
        convertDollarsToBillingCredits(totalCostInDollars),
      );

      return {
        result,
        usage: accumulatedUsage,
        cacheCreationTokens,
        nativeWebSearchCallCount,
        hasNoMoreAvailableCredits,
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
      const modelId = agent?.modelId ?? AUTO_SELECT_SMART_MODEL_ID;
      const costInDollars = this.aiBillingService.calculateCost(modelId, {
        usage: accumulatedUsage,
        cacheCreationTokens,
      });
      const creditsUsedMicro = Math.round(
        convertDollarsToBillingCredits(costInDollars),
      );
      const totalTokens =
        (accumulatedUsage.inputTokens ?? 0) +
        (accumulatedUsage.outputTokens ?? 0) +
        cacheCreationTokens;

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
