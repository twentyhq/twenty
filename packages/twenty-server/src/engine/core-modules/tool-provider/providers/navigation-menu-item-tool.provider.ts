import { Injectable } from '@nestjs/common';

import { ToolCategory } from 'twenty-shared/ai';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type StaticToolSets } from 'src/engine/core-modules/tool-provider/types/static-tool-sets.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { NavigationMenuItemToolWorkspaceService } from 'src/engine/metadata-modules/navigation-menu-item/tools/services/navigation-menu-item-tool.workspace-service';

@Injectable()
export class NavigationMenuItemToolProvider implements ToolProvider {
  readonly category = ToolCategory.NAVIGATION_MENU_ITEM;

  constructor(
    private readonly navigationMenuItemToolService: NavigationMenuItemToolWorkspaceService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    return toolSetToDescriptors(
      this.buildToolSets(context),
      ToolCategory.NAVIGATION_MENU_ITEM,
      { includeSchemas: options?.includeSchemas ?? true },
    );
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    return executeToolFromToolSet(
      this.buildToolSets(context),
      toolName,
      args,
      ToolCategory.NAVIGATION_MENU_ITEM,
    );
  }

  private buildToolSets(context: ToolProviderContext): StaticToolSets {
    return this.navigationMenuItemToolService.generateNavigationMenuItemTools(
      context.workspaceId,
      context.userWorkspaceId,
    );
  }
}
