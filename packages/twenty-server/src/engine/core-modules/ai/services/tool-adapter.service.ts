import { Injectable } from '@nestjs/common';

import { ToolSet } from 'ai';

import { ToolRegistryService } from 'src/engine/core-modules/tool/services/tool-registry.service';
import { ToolInput } from 'src/engine/core-modules/tool/types/tool-input.type';
import { Tool } from 'src/engine/core-modules/tool/types/tool.type';
import { PermissionFlagType } from 'src/engine/metadata-modules/permissions/constants/permission-flag-type.constants';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class ToolAdapterService {
  constructor(
    private readonly toolRegistry: ToolRegistryService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async getTools(roleId?: string, workspaceId?: string): Promise<ToolSet> {
    const tools: ToolSet = {};

    for (const toolType of this.toolRegistry.getAllToolTypes()) {
      const tool = this.toolRegistry.getTool(toolType);

      if (!tool.flag) {
        tools[toolType.toLowerCase()] = this.createToolSet(tool);
      } else if (roleId && workspaceId) {
        const hasPermission = await this.permissionsService.hasToolPermission(
          roleId,
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
      parameters: tool.parameters,
      execute: async (parameters: { input: ToolInput }) =>
        tool.execute(parameters.input),
    };
  }
}
