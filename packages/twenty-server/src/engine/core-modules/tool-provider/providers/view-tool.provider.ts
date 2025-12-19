import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewToolsFactory } from 'src/engine/metadata-modules/view/tools/view-tools.factory';

@Injectable()
export class ViewToolProvider implements ToolProvider {
  readonly category = ToolCategory.VIEW;

  constructor(
    private readonly viewToolsFactory: ViewToolsFactory,
    private readonly permissionsService: PermissionsService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    const workspaceMemberId = context.actorContext?.workspaceMemberId;

    const readTools = this.viewToolsFactory.generateReadTools(
      context.workspaceId,
      workspaceMemberId ?? undefined,
      workspaceMemberId ?? undefined,
    );

    const hasViewPermission =
      await this.permissionsService.checkRolesPermissions(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.VIEWS,
      );

    if (hasViewPermission) {
      const writeTools = this.viewToolsFactory.generateWriteTools(
        context.workspaceId,
        workspaceMemberId ?? undefined,
      );

      return { ...readTools, ...writeTools };
    }

    return readTools;
  }
}
