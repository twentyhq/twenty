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
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/workflow-agent-registry-tool-categories.const';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { WORKFLOW_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
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
      let providerOptions = {};

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

        // Workflow agent registry tools are scoped exclusively by the agent
        // permission-tab role. No role means no registry tools.
        if (isDefined(agentRoleId)) {
          const agentRolePermissionConfig: RolePermissionConfig = {
            unionOf: [agentRoleId],
          };

          const toolProviderContext: ToolProviderContext = {
            workspaceId: agent.workspaceId,
            roleId: agentRoleId,
            rolePermissionConfig: agentRolePermissionConfig,
            authContext,
            actorContext,
            userId:
              isDefined(authContext) && isUserAuthContext(authContext)
                ? authContext.user.id
                : undefined,
            userWorkspaceId:
              isDefined(authContext) && isUserAuthContext(authContext)
                ? authContext.userWorkspaceId
                : undefined,
          };

          registryTools = await this.toolRegistry.getToolsByCategories(
            toolProviderContext,
            {
              categories: WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES,
              wrapWithErrorContext: false,
            },
          );
        }

        const nativeTools = this.nativeToolBinder.bind(
          registeredModel,
          nativeModelToolOptions,
        );

        tools = {
          ...registryTools,
          ...nativeTools,
        };

        providerOptions =
          this.aiModelConfigService.getReasoningProviderOptions(
            registeredModel,
          );
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      let hasNoMoreAvailableCredits = false;

      const textResponse = await generateText({
        system: `${WORKFLOW_SYSTEM_PROMPTS.BASE}\n\n${agent ? agent.prompt : ''}`,
        tools,
        model: registeredModel.model,
        prompt: userPrompt,
        stopWhen: (step) =>
          stepCountIs(AGENT_CONFIG.MAX_STEPS)(step) ||
          hasNoMoreAvailableCredits,
        providerOptions,
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

          for (const part of step.content) {
            if (part.type !== 'tool-result' && part.type !== 'tool-error') {
              continue;
            }

            const succeeded =
              part.type === 'tool-result' &&
              (part.output as ToolOutput | undefined)?.success !== false;

            this.metricsService.incrementCounterBy({
              key: succeeded
                ? MetricsKeys.WorkflowAgentToolExecutionSucceeded
                : MetricsKeys.WorkflowAgentToolExecutionFailed,
              amount: 1,
              attributes: {
                model: registeredModel.modelId,
                tool: part.toolName,
              },
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
