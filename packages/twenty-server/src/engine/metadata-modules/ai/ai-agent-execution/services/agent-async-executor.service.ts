import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateObject,
  generateText,
  jsonSchema,
  stepCountIs,
  type ToolSet,
} from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';
import { type Repository } from 'typeorm';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { WORKFLOW_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AgentModelConfigService } from 'src/engine/metadata-modules/ai/ai-models/services/agent-model-config.service';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// Agent execution within workflows uses database and action tools only.
// Workflow tools are intentionally excluded to avoid circular dependencies
// and recursive workflow execution.
@Injectable()
export class AgentAsyncExecutorService {
  private readonly logger = new Logger(AgentAsyncExecutorService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly toolRegistry: ToolRegistryService,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
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
  }: {
    agent: AgentEntity | null;
    userPrompt: string;
    actorContext?: ActorMetadata;
    rolePermissionConfig?: RolePermissionConfig;
    authContext?: WorkspaceAuthContext;
  }): Promise<AgentExecutionResult> {
    try {
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

        // Workflow context: DATABASE_CRUD, ACTION, and NATIVE_MODEL tools only
        // Workflow tools are excluded to prevent circular dependencies
        const roleId = this.extractRoleIds(effectiveRoleConfig)[0] ?? '';

        tools = await this.toolRegistry.getToolsByCategories(
          {
            workspaceId: agent.workspaceId,
            roleId,
            rolePermissionConfig: effectiveRoleConfig ?? { unionOf: [] },
            authContext,
            actorContext,
            agent: agent as unknown as ToolProviderContext['agent'],
            userId: authContext?.user?.id,
            userWorkspaceId: authContext?.userWorkspaceId,
          },
          {
            categories: [
              ToolCategory.DATABASE_CRUD,
              ToolCategory.ACTION,
              ToolCategory.NATIVE_MODEL,
            ],
            wrapWithErrorContext: false,
          },
        );

        providerOptions = this.agentModelConfigService.getProviderOptions(
          registeredModel,
          agent as unknown as Parameters<
            typeof this.agentModelConfigService.getProviderOptions
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

      const agentSchema =
        agent?.responseFormat?.type === 'json'
          ? agent.responseFormat.schema
          : undefined;

      if (!agentSchema) {
        return {
          result: { response: textResponse.text },
          usage: textResponse.usage,
        };
      }

      const output = await generateObject({
        system: WORKFLOW_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
        model: registeredModel.model,
        prompt: `Based on the following execution results, generate the structured output according to the schema:

                 Execution Results: ${textResponse.text}

                 Please generate the structured output based on the execution results and context above.`,
        schema: jsonSchema(agentSchema),
        experimental_telemetry: AI_TELEMETRY_CONFIG,
      });

      return {
        result: output.object as object,
        usage: {
          inputTokens:
            (textResponse.usage?.inputTokens ?? 0) +
            (output.usage?.inputTokens ?? 0),
          outputTokens:
            (textResponse.usage?.outputTokens ?? 0) +
            (output.usage?.outputTokens ?? 0),
          totalTokens:
            (textResponse.usage?.totalTokens ?? 0) +
            (output.usage?.totalTokens ?? 0),
        },
      };
    } catch (error) {
      if (error instanceof AgentException) {
        throw error;
      }
      throw new AgentException(
        error instanceof Error ? error.message : 'Agent execution failed',
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
      );
    }
  }
}
