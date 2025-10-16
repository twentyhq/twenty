import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { type ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { type Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { type PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleContext } from 'src/engine/metadata-modules/role/types/role-context.type';

@Injectable()
export class ToolAdapterService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async getTools(
    roleContext?: RoleContext,
    workspaceId?: string,
  ): Promise<ToolSet> {
    const tools: ToolSet = {};

    for (const toolType of this.toolRegistry.getAllToolTypes()) {
      const tool = this.toolRegistry.getTool(toolType);

      if (!tool.flag) {
        tools[toolType.toLowerCase()] = this.createToolSet(tool);
      } else if (roleContext && workspaceId) {
        const hasPermission = await this.permissionsService.hasToolPermission(
          roleContext,
          workspaceId,
          tool.flag as PermissionFlagType,
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
      inputSchema: tool.inputSchema,
      execute: async (parameters: { input: ToolInput }) =>
        tool.execute(parameters.input),
    };
  }
}
