import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { DASHBOARD_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/dashboard-tool-service.token';
import { ToolCategory } from 'twenty-shared/ai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
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
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    if (!this.dashboardToolService) {
      return [];
    }

    const toolSet = await this.dashboardToolService.generateDashboardTools(
      context.workspaceId,
      context.rolePermissionConfig,
    );

    const icon = await this.resolveObjectIcon(
      context.workspaceId,
      CoreObjectNameSingular.Dashboard,
    );

    return toolSetToDescriptors(toolSet, ToolCategory.DASHBOARD, {
      includeSchemas: options?.includeSchemas ?? true,
      icon,
    });
  }

  private async resolveObjectIcon(
    workspaceId: string,
    nameSingular: string,
  ): Promise<string | undefined> {
    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const flatObject = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).find((obj) => obj?.nameSingular === nameSingular);

    return flatObject?.icon ?? undefined;
  }
}
