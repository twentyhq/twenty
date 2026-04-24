import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { executeToolFromToolSet } from 'src/engine/core-modules/tool-provider/utils/execute-tool-from-tool-set.util';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewFieldToolsFactory } from 'src/engine/metadata-modules/view-field/tools/view-field-tools.factory';

@Injectable()
export class ViewFieldToolProvider implements ToolProvider {
  readonly category = ToolCategory.VIEW_FIELD;

  constructor(
    private readonly viewFieldToolsFactory: ViewFieldToolsFactory,
    private readonly permissionsService: PermissionsService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const toolSet = await this.buildToolSet(context);

    return toolSetToDescriptors(toolSet, ToolCategory.VIEW_FIELD, {
      includeSchemas: options?.includeSchemas ?? true,
      icon: 'IconTable',
    });
  }

  async executeStaticTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolProviderContext,
  ): Promise<ToolOutput> {
    const toolSet = await this.buildToolSet(context);

    return executeToolFromToolSet(
      toolSet,
      toolName,
      args,
      ToolCategory.VIEW_FIELD,
    );
  }

  private async buildToolSet(context: ToolProviderContext): Promise<ToolSet> {
    const readTools = this.viewFieldToolsFactory.generateReadTools(
      context.workspaceId,
    );

    const hasViewPermission =
      await this.permissionsService.checkRolesPermissions(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.VIEWS,
      );

    if (!hasViewPermission) {
      return readTools;
    }

    const writeTools = this.viewFieldToolsFactory.generateWriteTools(
      context.workspaceId,
    );

    return { ...readTools, ...writeTools };
  }
}
