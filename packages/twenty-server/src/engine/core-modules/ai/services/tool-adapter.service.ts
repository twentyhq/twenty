import { Injectable } from '@nestjs/common';

import { ToolSet } from 'ai';

import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { UserRoleService } from 'src/engine/metadata-modules/user-role/user-role.service';

@Injectable()
export class ToolAdapterService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly userRoleService: UserRoleService,
  ) {}

  async getTools(roleId?: string, workspaceId?: string): Promise<ToolSet> {
    const tools: ToolSet = {};

    for (const toolType of this.toolRegistry.getAllToolTypes()) {
      const tool = this.toolRegistry.getTool(toolType);

      if (!tool.permissionFlag) {
        tools[toolType.toLowerCase()] = this.createToolSet(tool);
      } else if (roleId && workspaceId) {
        const hasPermission = await this.checkToolPermission(
          roleId,
          workspaceId,
          tool.permissionFlag as PermissionFlagType,
        );

        if (hasPermission) {
          tools[toolType.toLowerCase()] = this.createToolSet(tool);
        }
      }
    }

    return tools;
  }

  private createToolSet(tool: Tool) {
    return {
      description: tool.description,
      parameters: tool.parameters,
      execute: async (parameters: { input: ToolInput }) =>
        tool.execute(parameters.input),
    };
  }

  private async checkToolPermission(
    roleId: string,
    workspaceId: string,
    permissionFlag: PermissionFlagType,
  ): Promise<boolean> {
    try {
      const [role] = await this.userRoleService
        .getRolesByUserWorkspaces({
          userWorkspaceIds: [roleId],
          workspaceId,
        })
        .then((roles) => roles?.get(roleId) ?? []);

      if (!role) {
        return false;
      }

      if (role.canUpdateAllSettings === true) {
        return true;
      }

      const permissionFlags = role.permissionFlags ?? [];

      return permissionFlags.some(
        (settingPermission) =>
          settingPermission.permissionFlag === permissionFlag,
      );
    } catch (error) {
      return false;
    }
  }
}
