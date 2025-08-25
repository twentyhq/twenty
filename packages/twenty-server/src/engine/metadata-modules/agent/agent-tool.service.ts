import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ToolSet } from 'ai';
import { Repository } from 'typeorm';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { AgentHandoffExecutorService } from 'src/engine/metadata-modules/agent/agent-handoff-executor.service';
import { AgentHandoffService } from 'src/engine/metadata-modules/agent/agent-handoff.service';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { AGENT_HANDOFF_DESCRIPTION_TEMPLATE } from 'src/engine/metadata-modules/agent/constants/agent-handoff-description.const';
import { AGENT_HANDOFF_SCHEMA } from 'src/engine/metadata-modules/agent/constants/agent-handoff-schema.const';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkflowToolWorkspaceService as WorkflowToolService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';
import { camelCase } from 'src/utils/camel-case';

@Injectable()
export class AgentToolService {
  constructor(
    private readonly agentService: AgentService,
    private readonly agentHandoffService: AgentHandoffService,
    private readonly agentHandoffExecutorService: AgentHandoffExecutorService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly toolService: ToolService,
    private readonly toolAdapterService: ToolAdapterService,
    private readonly workflowToolService: WorkflowToolService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    const agent = await this.agentService.findOneAgent(agentId, workspaceId);

    const handoffTools = await this.generateHandoffTools(agentId, workspaceId);

    if (!agent.roleId) {
      const actionTools = await this.toolAdapterService.getTools();

      return { ...actionTools, ...handoffTools };
    }

    const role = await this.roleRepository.findOne({
      where: {
        id: agent.roleId,
        workspaceId,
      },
    });

    if (!role) {
      return {};
    }

    const actionTools = await this.toolAdapterService.getTools(
      role.id,
      workspaceId,
    );

    const databaseTools = await this.toolService.listTools(
      role.id,
      workspaceId,
    );

    const workflowTools = await this.generateWorkflowTools(role, workspaceId);

    return {
      ...databaseTools,
      ...actionTools,
      ...handoffTools,
      ...workflowTools,
    };
  }

  private async generateHandoffTools(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    const handoffs = await this.agentHandoffService.getAgentHandoffs({
      fromAgentId: agentId,
      workspaceId,
    });

    const handoffTools = handoffs.reduce<ToolSet>((tools, handoff) => {
      const toolName = `handoff_to_${camelCase(handoff.toAgent.name)}`;

      tools[toolName] = {
        description:
          handoff.description ||
          handoff.toAgent.description ||
          AGENT_HANDOFF_DESCRIPTION_TEMPLATE.replace(
            '{agentName}',
            handoff.toAgent.name,
          ),
        parameters: AGENT_HANDOFF_SCHEMA,
        execute: async ({ input }) => {
          const result = await this.agentHandoffExecutorService.executeHandoff({
            fromAgentId: agentId,
            toAgentId: handoff.toAgent.id,
            workspaceId,
            messages: input.messages,
          });

          return result;
        },
      };

      return tools;
    }, {});

    return handoffTools;
  }

  private async generateWorkflowTools(
    role: RoleEntity,
    workspaceId: string,
  ): Promise<ToolSet> {
    const hasWorkflowPermission = this.permissionsService.checkRolePermissions(
      role,
      PermissionFlagType.WORKFLOWS,
    );

    if (!hasWorkflowPermission) {
      return {};
    }

    return this.workflowToolService.generateWorkflowTools(workspaceId, role.id);
  }
}
