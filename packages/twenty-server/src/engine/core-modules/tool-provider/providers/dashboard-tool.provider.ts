import { Inject, Injectable, Optional } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { DASHBOARD_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/dashboard-tool-service.token';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import type { DashboardToolWorkspaceService } from 'src/modules/dashboard/tools/services/dashboard-tool.workspace-service';

@Injectable()
export class DashboardToolProvider implements ToolProvider {
  readonly category = ToolCategory.DASHBOARD;

  constructor(
    @Optional()
    @Inject(DASHBOARD_TOOL_SERVICE_TOKEN)
    private readonly dashboardToolService: DashboardToolWorkspaceService | null,
    private readonly permissionsService: PermissionsService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    if (!this.dashboardToolService) {
      return false;
    }

    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.LAYOUTS,
    );
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    if (!this.dashboardToolService) {
      return {};
    }

    return this.dashboardToolService.generateDashboardTools(
      context.workspaceId,
      context.rolePermissionConfig,
    );
  }
}
