import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ToolSet } from 'ai';
import { Repository } from 'typeorm';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkflowToolWorkspaceService as WorkflowToolService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

@Injectable()
export class AgentToolGeneratorService {
  private readonly logger = new Logger(AgentToolGeneratorService.name);

  constructor(
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly toolAdapterService: ToolAdapterService,
    private readonly toolService: ToolService,
    private readonly workflowToolService: WorkflowToolService,
    private readonly permissionsService: PermissionsService,
    private readonly agentService: AgentService,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    let tools: ToolSet = {};

    try {
      const agent = await this.agentService.findOneAgent(agentId, workspaceId);
      const actionTools = await this.toolAdapterService.getTools();

      tools = { ...actionTools };

      const roleId = agent.roleId;

      if (!roleId) {
        return tools;
      }

      const role = await this.roleRepository.findOne({
        where: {
          id: roleId,
          workspaceId,
        },
      });

      if (!role) {
        return tools;
      }

      const hasWorkflowPermission =
        this.permissionsService.checkRolePermissions(
          role,
          PermissionFlagType.WORKFLOWS,
        );

      if (hasWorkflowPermission) {
        const workflowTools = this.workflowToolService.generateWorkflowTools(
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

      const roleActionTools = await this.toolAdapterService.getTools(
        roleId,
        workspaceId,
      );

      tools = { ...tools, ...roleActionTools };
    } catch (toolError) {
      this.logger.warn(
        `Failed to generate tools for agent ${agentId}: ${toolError.message}. Proceeding without tools.`,
      );
    }

    return tools;
  }
}
