import { Injectable, OnModuleInit } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';

import { ToolCategory } from 'twenty-shared/ai';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewFieldToolsFactory } from 'src/engine/metadata-modules/view-field/tools/view-field-tools.factory';

@Injectable()
export class ViewFieldToolProvider implements ToolProvider, OnModuleInit {
  readonly category = ToolCategory.VIEW_FIELD;

  constructor(
    private readonly viewFieldToolsFactory: ViewFieldToolsFactory,
    private readonly permissionsService: PermissionsService,
    private readonly toolExecutorService: ToolExecutorService,
  ) {}

  onModuleInit(): void {
    const factory = this.viewFieldToolsFactory;

    this.toolExecutorService.registerCategoryGenerator(
      ToolCategory.VIEW_FIELD,
      async (context) => {
        const readTools = factory.generateReadTools(context.workspaceId);

        const hasViewPermission =
          await this.permissionsService.checkRolesPermissions(
            context.rolePermissionConfig,
            context.workspaceId,
            PermissionFlagType.VIEWS,
          );

        if (hasViewPermission) {
          const writeTools = factory.generateWriteTools(context.workspaceId);

          return { ...readTools, ...writeTools };
        }

        return readTools;
      },
    );
  }

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const schemaOptions = {
      includeSchemas: options?.includeSchemas ?? true,
      icon: 'IconTable',
    };

    const readTools = this.viewFieldToolsFactory.generateReadTools(
      context.workspaceId,
    );

    const hasViewPermission =
      await this.permissionsService.checkRolesPermissions(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.VIEWS,
      );

    if (hasViewPermission) {
      const writeTools = this.viewFieldToolsFactory.generateWriteTools(
        context.workspaceId,
      );

      return toolSetToDescriptors(
        { ...readTools, ...writeTools },
        ToolCategory.VIEW_FIELD,
        schemaOptions,
      );
    }

    return toolSetToDescriptors(
      readTools,
      ToolCategory.VIEW_FIELD,
      schemaOptions,
    );
  }
}
