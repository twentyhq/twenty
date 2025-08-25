import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { generateText, type ToolSet } from 'ai';
import { Repository } from 'typeorm';

import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { AGENT_HANDOFF_PROMPT_TEMPLATE } from 'src/engine/metadata-modules/agent/constants/agent-handoff-prompt.const';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { WorkflowToolWorkspaceService as WorkflowToolService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

import { AgentHandoffService } from './agent-handoff.service';
import { AgentEntity } from './agent.entity';
import { AgentException, AgentExceptionCode } from './agent.exception';

export type HandoffRequest = {
  fromAgentId: string;
  toAgentId: string;
  workspaceId: string;
  reason: string;
  context?: string;
};

@Injectable()
export class AgentHandoffExecutorService {
  private readonly logger = new Logger(AgentHandoffExecutorService.name);

  constructor(
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleTargetsEntity, 'core')
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly agentHandoffService: AgentHandoffService,
    private readonly aiModelRegistryService: AiModelRegistryService,
    private readonly toolAdapterService: ToolAdapterService,
    private readonly toolService: ToolService,
    private readonly workflowToolService: WorkflowToolService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async executeHandoff(handoffRequest: HandoffRequest) {
    try {
      const { fromAgentId, toAgentId, workspaceId } = handoffRequest;

      const canHandoff = await this.agentHandoffService.canHandoffTo({
        fromAgentId,
        toAgentId,
        workspaceId,
      });

      if (!canHandoff) {
        throw new AgentException(
          `Agent ${fromAgentId} is not allowed to hand off to agent ${toAgentId}`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      const targetAgent = await this.agentRepository.findOne({
        where: { id: toAgentId, workspaceId },
      });

      if (!targetAgent) {
        throw new AgentException(
          `Target agent ${toAgentId} not found`,
          AgentExceptionCode.AGENT_NOT_FOUND,
        );
      }

      const registeredModel = this.aiModelRegistryService.getModel(
        targetAgent.modelId,
      );

      if (!registeredModel) {
        throw new AgentException(
          `Model ${targetAgent.modelId} not found in registry`,
          AgentExceptionCode.AGENT_EXECUTION_FAILED,
        );
      }

      const tools = await this.generateToolsForAgent(toAgentId, workspaceId);

      const aiRequestConfig = {
        system: targetAgent.prompt,
        prompt: this.createHandoffPrompt(handoffRequest),
        tools,
        model: registeredModel.model,
      };

      const textResponse = await generateText(aiRequestConfig);

      this.logger.log(
        `Successfully executed handoff to agent ${toAgentId} with response length: ${textResponse.text.length}`,
      );

      return textResponse.text;
    } catch (error) {
      this.logger.error(
        `Handoff execution failed: ${error.message}`,
        error.stack,
      );

      return {
        success: false,
        newAgentId: handoffRequest.toAgentId,
        newAgentName: 'Unknown',
        error: error.message,
      };
    }
  }

  private async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    let tools = {};

    try {
      const actionTools = await this.toolAdapterService.getTools();

      tools = { ...actionTools };

      const roleTarget = await this.roleTargetsRepository.findOne({
        where: {
          agentId,
          workspaceId,
        },
        select: ['roleId'],
      });

      if (!roleTarget?.roleId) {
        return tools;
      }

      const roleId = roleTarget.roleId;

      const hasWorkflowPermission =
        this.permissionsService.checkRolePermissions(
          roleTarget.role,
          PermissionFlagType.WORKFLOWS,
        );

      if (hasWorkflowPermission) {
        const workflowTools =
          await this.workflowToolService.generateWorkflowTools(
            workspaceId,
            roleId,
          );

        tools = { ...tools, ...workflowTools };
      }

      const databaseTools = await this.toolService.listTools(
        roleId,
        workspaceId,
      );

      tools = { ...tools, ...databaseTools };
    } catch (toolError) {
      this.logger.warn(
        `Failed to generate tools for agent ${agentId}: ${toolError.message}. Proceeding without tools.`,
      );
    }

    return tools;
  }

  private createHandoffPrompt(handoffRequest: HandoffRequest): string {
    const { reason, context } = handoffRequest;

    return AGENT_HANDOFF_PROMPT_TEMPLATE.replace('{reason}', reason).replace(
      '{context}',
      context || 'No additional context provided',
    );
  }
}
