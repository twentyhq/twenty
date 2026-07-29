import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { ToolCategory } from 'twenty-shared/ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { RoleToolWorkspaceService } from 'src/engine/metadata-modules/role/tools/services/role-tool.workspace-service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

const getCallerRoleIds = (
  rolePermissionConfig: RolePermissionConfig,
): string[] => {
  if ('unionOf' in rolePermissionConfig) {
    return rolePermissionConfig.unionOf;
  }

  if ('intersectionOf' in rolePermissionConfig) {
    return rolePermissionConfig.intersectionOf;
  }

  return [];
};

@Injectable()
export class RoleToolProvider implements ToolProvider {
  readonly category = ToolCategory.ROLE;

  constructor(
    private readonly roleToolWorkspaceService: RoleToolWorkspaceService,
    private readonly permissionsService: PermissionsService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.ROLES,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    return toolSetToDescriptors(this.buildToolSet(context), ToolCategory.ROLE, {
      includeSchemas: options?.includeSchemas ?? true,
    });
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    return executeToolFromToolSet(
      this.buildToolSet(context),
      toolName,
      args,
      ToolCategory.ROLE,
    );
  }

  private buildToolSet(context: ToolProviderContext): ToolSet {
    const callerRoleIds = new Set([
      ...getCallerRoleIds(context.rolePermissionConfig),
      context.roleId,
    ]);

    return this.roleToolWorkspaceService.generateRoleTools({
      workspaceId: context.workspaceId,
      callerRoleIds: [...callerRoleIds],
      callerWorkspaceMemberId:
        context.actorContext?.workspaceMemberId ?? undefined,
      callerUserWorkspaceId: context.userWorkspaceId,
    });
  }
}
