import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { DASHBOARD_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/dashboard-tool-service.token';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import type { DashboardToolWorkspaceService } from 'src/modules/dashboard/tools/services/dashboard-tool.workspace-service';

@Injectable()
export class DashboardToolProvider implements ToolProvider, OnModuleInit {
  readonly category = ToolCategory.DASHBOARD;

  constructor(
    @Optional()
    @Inject(DASHBOARD_TOOL_SERVICE_TOKEN)
    private readonly dashboardToolService: DashboardToolWorkspaceService | null,
    private readonly permissionsService: PermissionsService,
    private readonly toolExecutorService: ToolExecutorService,
  ) {}

  onModuleInit(): void {
    if (this.dashboardToolService) {
      const service = this.dashboardToolService;

      this.toolExecutorService.registerCategoryGenerator(
        ToolCategory.DASHBOARD,
        async (context) =>
          service.generateDashboardTools(
            context.workspaceId,
            context.rolePermissionConfig,
          ),
      );
    }
  }

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

  async generateDescriptors(
    context: ToolProviderContext,
  ): Promise<ToolDescriptor[]> {
    if (!this.dashboardToolService) {
      return [];
    }

    const toolSet = await this.dashboardToolService.generateDashboardTools(
      context.workspaceId,
      context.rolePermissionConfig,
    );

    return toolSetToDescriptors(toolSet, ToolCategory.DASHBOARD);
  }
}
