import { isDefined } from 'twenty-shared/utils';
import { Inject, Injectable, Optional } from '@nestjs/common';
import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { ToolCategory } from 'twenty-shared/ai';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { DASHBOARD_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/dashboard-tool-service.token';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { SettingPermissionsService } from 'src/engine/permissions/setting-permissions.service';
import type { DashboardToolWorkspaceService } from 'src/modules/dashboard/tools/services/dashboard-tool.workspace-service';

@Injectable()
export class DashboardToolProvider implements ToolProvider {
  readonly category = ToolCategory.PAGE_LAYOUT;

  constructor(
    @Optional()
    @Inject(DASHBOARD_TOOL_SERVICE_TOKEN)
    private readonly dashboardToolService: DashboardToolWorkspaceService | null,
    private readonly settingPermissionsService: SettingPermissionsService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    if (!this.dashboardToolService) {
      return false;
    }

    return this.settingPermissionsService.hasPermissionFlag({
      authContext: context.authContext,
      permissionFlag: PermissionFlagType.LAYOUTS,
    });
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const toolSet = await this.buildToolSet(context);

    if (!toolSet) {
      return [];
    }

    return toolSetToDescriptors(toolSet, ToolCategory.PAGE_LAYOUT, {
      includeSchemas: options?.includeSchemas ?? true,
      icon: 'IconAppWindow',
    });
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const toolSet = await this.buildToolSet(context);

    if (!toolSet) {
      throw new Error(
        `Dashboard tool service is not available (tool: ${toolName})`,
      );
    }

    return executeToolFromToolSet(
      toolSet,
      toolName,
      args,
      ToolCategory.PAGE_LAYOUT,
    );
  }

  private async buildToolSet(
    context: ToolProviderContext,
  ): Promise<ToolSet | null> {
    if (!this.dashboardToolService || !isDefined(context.authContext)) {
      return null;
    }

    return this.dashboardToolService.generateDashboardTools({
      workspaceId: context.workspaceId,
      authContext: context.authContext,
      callingApplication: context.application,
    });
  }
}
