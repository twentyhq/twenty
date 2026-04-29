import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateText,
  jsonSchema,
  type LanguageModelUsage,
  Output,
  stepCountIs,
  type ToolSet,
} from 'ai';
import { AUTO_SELECT_SMART_MODEL_ID } from 'twenty-shared/constants';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';

import { isUserAuthContext } from 'src/engine/core-modules/auth/guards/is-user-auth-context.guard';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { BillingUsageService } from 'src/engine/core-modules/billing/services/billing-usage.service';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { NativeToolBinderService } from 'src/engine/core-modules/tool-provider/native/native-tool-binder.service';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/workflow-agent-registry-tool-categories.const';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import { AiBillingService } from 'src/engine/metadata-modules/ai/ai-billing/services/ai-billing.service';
import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';
import { extractCacheCreationTokensFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/extract-cache-creation-tokens.util';
import { mergeLanguageModelUsage } from 'src/engine/metadata-modules/ai/ai-billing/utils/merge-language-model-usage.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { WORKFLOW_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

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
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  private extractRoleIds(
    rolePermissionConfig?: RolePermissionConfig,
  ): string[] {
    if (!rolePermissionConfig) {
      return [];
    }

    if ('intersectionOf' in rolePermissionConfig) {
      return rolePermissionConfig.intersectionOf;
    }

    if ('unionOf' in rolePermissionConfig) {
      return rolePermissionConfig.unionOf;
    }

    return [];
  }

  private async getEffectiveRolePermissionConfig(
    agentId: string,
    workspaceId: string,
    rolePermissionConfig?: RolePermissionConfig,
  ): Promise<RolePermissionConfig | undefined> {
    const roleTarget = await this.roleTargetRepository.findOne({
      where: {
        agentId,
        workspaceId,
      },
      select: ['roleId'],
    });

    const agentRoleId = roleTarget?.roleId;
    const configRoleIds = this.extractRoleIds(rolePermissionConfig);

    const allRoleIds = agentRoleId
      ? [...new Set([...configRoleIds, agentRoleId])]
      : configRoleIds;

    if (allRoleIds.length === 0) {
      return undefined;
    }

    return { intersectionOf: allRoleIds };
  }

  async executeAgent({
    agent,
    userPrompt,
    actorContext,
    rolePermissionConfig,
    authContext,
    workspaceId,
    userWorkspaceId,
    operationType = UsageOperationType.AI_WORKFLOW_TOKEN,
  }: {
    agent: AgentEntity | null;
    userPrompt: string;
    actorContext?: ActorMetadata;
    rolePermissionConfig?: RolePermissionConfig;
    authContext?: WorkspaceAuthContext;
    workspaceId: string;
    userWorkspaceId?: string | null;
    operationType?: UsageOperationType;
  }): Promise<AgentExecutionResult> {
    await this.billingUsageService.hasAvailableCreditsOrThrow(workspaceId);

    let accumulatedUsage: LanguageModelUsage = EMPTY_USAGE;
    let cacheCreationTokens = 0;
    let nativeWebSearchCallCount = 0;

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
        const effectiveRoleConfig = await this.getEffectiveRolePermissionConfig(
          agent.id,
          agent.workspaceId,
          rolePermissionConfig,
        );

        // Workflow context: registry tools come from DATABASE_CRUD and ACTION.
        // Native model tools are bound separately below.
        const roleId = this.extractRoleIds(effectiveRoleConfig)[0] ?? '';

        const toolProviderContext: ToolProviderContext = {
          workspaceId: agent.workspaceId,
          roleId,
          rolePermissionConfig: effectiveRoleConfig ?? { unionOf: [] },
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

        const registryTools = await this.toolRegistry.getToolsByCategories(
          toolProviderContext,
          {
            categories: WORKFLOW_AGENT_REGISTRY_TOOL_CATEGORIES,
            wrapWithErrorContext: false,
          },
        );

        const nativeTools = this.nativeToolBinder.bind(registeredModel, {
          webSearchEnabled:
            agent.modelConfiguration?.webSearch?.enabled === true,
        });

        tools = {
          ...registryTools,
          ...nativeTools,
        };

        providerOptions = this.aiModelConfigService.getProviderOptions(
          registeredModel,
          agent as unknown as Parameters<
            typeof this.aiModelConfigService.getProviderOptions
          >[1],
        );
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      const textResponse = await generateText({
        system: `${WORKFLOW_SYSTEM_PROMPTS.BASE}\n\n${agent ? agent.prompt : ''}`,
        tools,
        model: registeredModel.model,
        prompt: userPrompt,
        stopWhen: stepCountIs(AGENT_CONFIG.MAX_STEPS),
        providerOptions,
        experimental_telemetry: AI_TELEMETRY_CONFIG,
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

      const agentSchema =
        agent?.responseFormat?.type === 'json'
          ? agent.responseFormat.schema
          : undefined;

      if (!agentSchema) {
        return {
          result: { response: textResponse.text },
          usage: textResponse.usage,
          cacheCreationTokens,
          nativeWebSearchCallCount,
        };
      }

      const structuredResult = await generateText({
        system: WORKFLOW_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
        model: registeredModel.model,
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

                 Please generate the structured output based on the execution results and context above.`,
        output: Output.object({ schema: jsonSchema(agentSchema) }),
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

      accumulatedUsage = mergeLanguageModelUsage(
        textResponse.usage,
        structuredResult.usage,
      );

      if (structuredResult.output == null) {
        throw new AiException(
          'Failed to generate structured output from execution results',
          AiExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      return {
        result: structuredResult.output as object,
        usage: accumulatedUsage,
        cacheCreationTokens,
        nativeWebSearchCallCount,
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
      this.aiBillingService.calculateAndBillUsage(
        agent?.modelId ?? AUTO_SELECT_SMART_MODEL_ID,
        { usage: accumulatedUsage, cacheCreationTokens },
        workspaceId,
        operationType,
        agent?.id ?? null,
        userWorkspaceId,
      );

      this.aiBillingService.billNativeWebSearchUsage(
        nativeWebSearchCallCount,
        workspaceId,
        userWorkspaceId,
      );
    }
  }
}
