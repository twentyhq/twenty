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
import { ViewFilterToolsFactory } from 'src/engine/metadata-modules/view-filter/tools/view-filter-tools.factory';
import { ViewSortToolsFactory } from 'src/engine/metadata-modules/view-sort/tools/view-sort-tools.factory';
import { ViewToolsFactory } from 'src/engine/metadata-modules/view/tools/view-tools.factory';

@Injectable()
export class ViewToolProvider implements ToolProvider, OnModuleInit {
  readonly category = ToolCategory.VIEW;

  constructor(
    private readonly viewToolsFactory: ViewToolsFactory,
    private readonly viewFilterToolsFactory: ViewFilterToolsFactory,
    private readonly viewSortToolsFactory: ViewSortToolsFactory,
    private readonly permissionsService: PermissionsService,
    private readonly toolExecutorService: ToolExecutorService,
  ) {}

  onModuleInit(): void {
    const viewFactory = this.viewToolsFactory;
    const filterFactory = this.viewFilterToolsFactory;
    const sortFactory = this.viewSortToolsFactory;

    this.toolExecutorService.registerCategoryGenerator(
      ToolCategory.VIEW,
      async (context) => {
        const workspaceMemberId = context.actorContext?.workspaceMemberId;

        const readTools = {
          ...viewFactory.generateReadTools(
            context.workspaceId,
            workspaceMemberId ?? undefined,
            workspaceMemberId ?? undefined,
          ),
          ...filterFactory.generateReadTools(context.workspaceId),
          ...sortFactory.generateReadTools(context.workspaceId),
        };

        const hasViewPermission =
          await this.permissionsService.checkRolesPermissions(
            context.rolePermissionConfig,
            context.workspaceId,
            PermissionFlagType.VIEWS,
          );

        if (hasViewPermission) {
          const writeTools = {
            ...viewFactory.generateWriteTools(
              context.workspaceId,
              workspaceMemberId ?? undefined,
            ),
            ...filterFactory.generateWriteTools(context.workspaceId),
            ...sortFactory.generateWriteTools(context.workspaceId),
          };

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
    const workspaceMemberId = context.actorContext?.workspaceMemberId;
    const schemaOptions = {
      includeSchemas: options?.includeSchemas ?? true,
    };

    const readTools = {
      ...this.viewToolsFactory.generateReadTools(
        context.workspaceId,
        workspaceMemberId ?? undefined,
        workspaceMemberId ?? undefined,
      ),
      ...this.viewFilterToolsFactory.generateReadTools(context.workspaceId),
      ...this.viewSortToolsFactory.generateReadTools(context.workspaceId),
    };

    const hasViewPermission =
      await this.permissionsService.checkRolesPermissions(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.VIEWS,
      );

    if (hasViewPermission) {
      const writeTools = {
        ...this.viewToolsFactory.generateWriteTools(
          context.workspaceId,
          workspaceMemberId ?? undefined,
        ),
        ...this.viewFilterToolsFactory.generateWriteTools(context.workspaceId),
        ...this.viewSortToolsFactory.generateWriteTools(context.workspaceId),
      };

      return toolSetToDescriptors(
        { ...readTools, ...writeTools },
        ToolCategory.VIEW,
        schemaOptions,
      );
    }

    return toolSetToDescriptors(readTools, ToolCategory.VIEW, schemaOptions);
  }
}
