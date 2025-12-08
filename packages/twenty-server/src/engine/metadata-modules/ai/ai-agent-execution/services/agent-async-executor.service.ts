import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  generateObject,
  generateText,
  jsonSchema,
  stepCountIs,
  ToolSet,
} from 'ai';
import { type ActorMetadata } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { type AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-execution-result.type';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { repairToolCall } from 'src/engine/metadata-modules/ai/ai-agent/utils/repair-tool-call.util';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ToolAdapterService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool-adapter.service';
import { ToolService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool.service';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

import { AgentModelConfigService } from './agent-model-config.service';

// Agent execution within workflows uses database and action tools only.
// Workflow tools are intentionally excluded to avoid circular dependencies
// and recursive workflow execution.
@Injectable()
export class AgentAsyncExecutorService {
  private readonly logger = new Logger(AgentAsyncExecutorService.name);

  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly agentModelConfigService: AgentModelConfigService,
    private readonly toolAdapterService: ToolAdapterService,
    private readonly toolService: ToolService,
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

  private async getToolsForWorkflowExecution(
    agentId: string,
    workspaceId: string,
    actorContext?: ActorMetadata,
    rolePermissionConfig?: RolePermissionConfig,
  ): Promise<ToolSet> {
    const roleTarget = await this.roleTargetRepository.findOne({
      where: {
        agentId,
        workspaceId,
      },
      select: ['roleId'],
    });

    const agentRoleId = roleTarget?.roleId;
    const configRoleIds = this.extractRoleIds(rolePermissionConfig);

    // Combine role IDs from config and agent
    const allRoleIds = agentRoleId
      ? [...new Set([...configRoleIds, agentRoleId])]
      : configRoleIds;

    if (allRoleIds.length === 0) {
      // No role context - return basic action tools only
      return this.toolAdapterService.getTools(workspaceId);
    }

    const effectiveRoleContext: RolePermissionConfig = {
      intersectionOf: allRoleIds,
    };

    // Get database CRUD tools
    const databaseTools = await this.toolService.listTools(
      effectiveRoleContext,
      workspaceId,
      actorContext,
    );

    // Get action tools (send email, http request, etc.)
    const actionTools = await this.toolAdapterService.getTools(
      workspaceId,
      effectiveRoleContext,
    );

    return {
      ...databaseTools,
      ...actionTools,
    };
  }

  async executeAgent({
    agent,
    userPrompt,
    actorContext,
    rolePermissionConfig,
  }: {
    agent: AgentEntity | null;
    userPrompt: string;
    actorContext?: ActorMetadata;
    rolePermissionConfig?: RolePermissionConfig;
  }): Promise<AgentExecutionResult> {
    try {
      const registeredModel =
        await this.aiModelRegistryService.resolveModelForAgent(agent);

      let tools: ToolSet = {};
      let providerOptions = {};

      if (agent) {
        tools = await this.getToolsForWorkflowExecution(
          agent.id,
          agent.workspaceId,
          actorContext,
          rolePermissionConfig,
        );

        // Add native model tools (web search, etc.) if configured
        const nativeModelTools =
          this.agentModelConfigService.getNativeModelTools(
            registeredModel,
            agent as unknown as Parameters<
              typeof this.agentModelConfigService.getNativeModelTools
            >[1],
          );

        tools = { ...tools, ...nativeModelTools };

        providerOptions = this.agentModelConfigService.getProviderOptions(
          registeredModel,
          agent as unknown as Parameters<
            typeof this.agentModelConfigService.getProviderOptions
          >[1],
        );
      }

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      const textResponse = await generateText({
        system: `${AGENT_SYSTEM_PROMPTS.BASE}\n${AGENT_SYSTEM_PROMPTS.WORKFLOW_ADDITIONS}\n\n${agent ? agent.prompt : ''}`,
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
        system: AGENT_SYSTEM_PROMPTS.OUTPUT_GENERATOR,
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
