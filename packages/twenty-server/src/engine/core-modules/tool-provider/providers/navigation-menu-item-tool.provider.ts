import { Inject, Injectable, Optional } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { ToolCategory } from 'twenty-shared/ai';

import { NAVIGATION_MENU_ITEM_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/navigation-menu-item-tool-service.token';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import type { NavigationMenuItemToolWorkspaceService } from 'src/engine/metadata-modules/navigation-menu-item/tools/services/navigation-menu-item-tool.workspace-service';

// The navigation tools cover both workspace navigation (gated by LAYOUTS at
// service level) and user favorites (available to any authenticated user).
// We expose the tools whenever the service token is present and let the
// underlying NavigationMenuItemAccessService raise on disallowed writes.
@Injectable()
export class NavigationMenuItemToolProvider implements ToolProvider {
  readonly category = ToolCategory.NAVIGATION;

  constructor(
    @Optional()
    @Inject(NAVIGATION_MENU_ITEM_TOOL_SERVICE_TOKEN)
    private readonly navigationMenuItemToolService: NavigationMenuItemToolWorkspaceService | null,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return this.navigationMenuItemToolService !== null;
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const toolSet = await this.buildToolSet(context);

    if (!toolSet) {
      return [];
    }

    return toolSetToDescriptors(toolSet, ToolCategory.NAVIGATION, {
      includeSchemas: options?.includeSchemas ?? true,
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
        `Navigation menu item tool service is not available (tool: ${toolName})`,
      );
    }

    return executeToolFromToolSet(
      toolSet,
      toolName,
      args,
      ToolCategory.NAVIGATION,
    );
  }

  private async buildToolSet(
    context: ToolProviderContext,
  ): Promise<ToolSet | null> {
    if (!this.navigationMenuItemToolService) {
      return null;
    }

    return this.navigationMenuItemToolService.generateNavigationMenuItemTools(
      context.workspaceId,
      context.userWorkspaceId,
    );
  }
}
