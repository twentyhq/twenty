import { Injectable, OnModuleInit } from '@nestjs/common';

import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type GenerateDescriptorOptions,
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolExecutorService } from 'src/engine/core-modules/tool-provider/services/tool-executor.service';
import {
  type ToolDescriptor,
  type ToolIndexEntry,
} from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { toolSetToDescriptors } from 'src/engine/core-modules/tool-provider/utils/tool-set-to-descriptors.util';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { ViewToolsFactory } from 'src/engine/metadata-modules/view/tools/view-tools.factory';

@Injectable()
export class ViewToolProvider implements ToolProvider, OnModuleInit {
  readonly category = ToolCategory.VIEW;

  constructor(
    private readonly viewToolsFactory: ViewToolsFactory,
    private readonly permissionsService: PermissionsService,
    private readonly toolExecutorService: ToolExecutorService,
  ) {}

  onModuleInit(): void {
    const factory = this.viewToolsFactory;

    this.toolExecutorService.registerCategoryGenerator(
      ToolCategory.VIEW,
      async (context) => {
        const workspaceMemberId = context.actorContext?.workspaceMemberId;

        const readTools = factory.generateReadTools(
          context.workspaceId,
          workspaceMemberId ?? undefined,
          workspaceMemberId ?? undefined,
        );

        const hasViewPermission =
          await this.permissionsService.checkRolesPermissions(
            context.rolePermissionConfig,
            context.workspaceId,
            PermissionFlagType.VIEWS,
          );

        if (hasViewPermission) {
          const writeTools = factory.generateWriteTools(
            context.workspaceId,
            workspaceMemberId ?? undefined,
          );

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

    const readTools = this.viewToolsFactory.generateReadTools(
      context.workspaceId,
      workspaceMemberId ?? undefined,
      workspaceMemberId ?? undefined,
    );

    const hasViewPermission =
      await this.permissionsService.checkRolesPermissions(
        context.rolePermissionConfig,
        context.workspaceId,
        PermissionFlagType.VIEWS,
      );

    if (hasViewPermission) {
      const writeTools = this.viewToolsFactory.generateWriteTools(
        context.workspaceId,
        workspaceMemberId ?? undefined,
      );

      return toolSetToDescriptors(
        { ...readTools, ...writeTools },
        ToolCategory.VIEW,
        schemaOptions,
      );
    }

    return toolSetToDescriptors(readTools, ToolCategory.VIEW, schemaOptions);
  }
}
