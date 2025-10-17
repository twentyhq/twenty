import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ToolSet } from 'ai';
import { In, Repository } from 'typeorm';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { type ActorMetadata } from 'src/engine/metadata-modules/field-metadata/composite-types/actor.composite-type';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkflowToolWorkspaceService as WorkflowToolService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

@Injectable()
export class AgentToolGeneratorService {
  private readonly logger = new Logger(AgentToolGeneratorService.name);

  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly toolAdapterService: ToolAdapterService,
    private readonly toolService: ToolService,
    private readonly workflowToolService: WorkflowToolService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
    actorContext?: ActorMetadata,
    roleIds?: string[],
  ): Promise<ToolSet> {
    let tools: ToolSet = {};

    try {
      const actionTools = await this.toolAdapterService.getTools();

      tools = { ...actionTools };

      if (!roleIds) {
        return tools;
      }

      const roles = await this.roleRepository.find({
        where: { id: In(roleIds), workspaceId },
        relations: ['permissionFlags'],
      });

      if (roles.length !== roleIds.length) {
        return tools;
      }

      const hasWorkflowPermission =
        roles.length === 1
          ? this.permissionsService.checkRolePermissions(
              roles[0],
              PermissionFlagType.WORKFLOWS,
            )
          : this.permissionsService.checkRolesPermissions(
              roles,
              PermissionFlagType.WORKFLOWS,
            );

      if (hasWorkflowPermission) {
        const workflowTools = this.workflowToolService.generateWorkflowTools(
          workspaceId,
          { roleIds },
        );

        tools = { ...tools, ...workflowTools };
      }

      const databaseTools = await this.toolService.listTools(
        { roleIds },
        workspaceId,
        actorContext,
      );

      tools = { ...tools, ...databaseTools };

      const roleActionTools = await this.toolAdapterService.getTools(
        { roleIds },
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
