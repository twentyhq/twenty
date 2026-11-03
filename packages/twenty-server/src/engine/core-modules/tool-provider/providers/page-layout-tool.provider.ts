import { isDefined } from 'twenty-shared/utils';
import { Inject, Injectable, Optional } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { PAGE_LAYOUT_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/page-layout-tool-service.token';
import { ToolCategory } from 'twenty-shared/ai';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PermissionsService } from 'src/engine/permissions/permissions.service';
import type { PageLayoutToolService } from 'src/engine/metadata-modules/page-layout/tools/services/page-layout-tool.service';

@Injectable()
export class PageLayoutToolProvider implements ToolProvider {
  readonly category = ToolCategory.PAGE_LAYOUT;

  constructor(
    @Optional()
    @Inject(PAGE_LAYOUT_TOOL_SERVICE_TOKEN)
    private readonly pageLayoutToolService: PageLayoutToolService | null,
    private readonly permissionsService: PermissionsService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    if (!this.pageLayoutToolService) {
      return false;
    }

    return this.permissionsService.hasPermissionFlag({
      authContext: context.authContext,
      setting: PermissionFlagType.LAYOUTS,
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
        `Page layout tool service is not available (tool: ${toolName})`,
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
    if (!this.pageLayoutToolService || !isDefined(context.authContext)) {
      return null;
    }

    return this.pageLayoutToolService.generatePageLayoutTools(
      context.workspaceId,
      context.authContext,
    );
  }
}
