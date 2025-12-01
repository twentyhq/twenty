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

import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AGENT_CONFIG } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-config.const';
import { AGENT_SYSTEM_PROMPTS } from 'src/engine/metadata-modules/ai/ai-agent/constants/agent-system-prompts.const';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { AgentExecutionResult } from 'src/engine/metadata-modules/ai/ai-agent/services/agent-execution.service';
import { AI_TELEMETRY_CONFIG } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-telemetry.const';
import { AiModelRegistryService } from 'src/engine/metadata-modules/ai/ai-models/services/ai-model-registry.service';
import { ToolAdapterService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool-adapter.service';
import { ToolService } from 'src/engine/metadata-modules/ai/ai-tools/services/tool.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

@Injectable()
export class AgentAsyncExecutorService {
  private readonly logger = new Logger(AgentAsyncExecutorService.name);
  constructor(
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly toolAdapterService: ToolAdapterService,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly toolService: ToolService,
  ) {}

  private async getTools(
    agentId: string,
    workspaceId: string,
    actorContext?: ActorMetadata,
    rolePermissionConfig?: RolePermissionConfig,
  ): Promise<ToolSet> {
    const roleTarget = await this.roleTargetsRepository.findOne({
      where: {
        agentId: agentId,
        workspaceId,
      },
      select: ['roleId'],
    });

    const agentRoleId = roleTarget?.roleId;

    if (!rolePermissionConfig && !agentRoleId) {
      return await this.toolAdapterService.getTools();
    }

    let effectiveRoleContext: RolePermissionConfig;

    if (
      rolePermissionConfig &&
      ('intersectionOf' in rolePermissionConfig ||
        'unionOf' in rolePermissionConfig)
    ) {
      effectiveRoleContext = rolePermissionConfig;
    } else if (agentRoleId) {
      effectiveRoleContext = { unionOf: [agentRoleId] };
    } else {
      return await this.toolAdapterService.getTools();
    }

    const actionTools = await this.toolAdapterService.getTools(
      effectiveRoleContext,
      workspaceId,
    );

    const databaseTools = await this.toolService.listTools(
      effectiveRoleContext,
      workspaceId,
      actorContext,
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

      const tools = agent
        ? await this.getTools(
            agent.id,
            agent.workspaceId,
            actorContext,
            rolePermissionConfig,
          )
        : {};

      this.logger.log(`Generated ${Object.keys(tools).length} tools for agent`);

      const textResponse = await generateText({
        system: `${AGENT_SYSTEM_PROMPTS.BASE}\n${AGENT_SYSTEM_PROMPTS.WORKFLOW_ADDITIONS}\n\n${agent ? agent.prompt : ''}`,
        tools,
        model: registeredModel.model,
        prompt: userPrompt,
        stopWhen: stepCountIs(AGENT_CONFIG.MAX_STEPS),
        experimental_telemetry: AI_TELEMETRY_CONFIG,
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
