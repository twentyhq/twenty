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
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class MetadataToolProvider implements ToolProvider, OnModuleInit {
  readonly category = ToolCategory.METADATA;

  constructor(
    private readonly objectMetadataToolsFactory: ObjectMetadataToolsFactory,
    private readonly fieldMetadataToolsFactory: FieldMetadataToolsFactory,
    private readonly permissionsService: PermissionsService,
    private readonly toolExecutorService: ToolExecutorService,
  ) {}

  onModuleInit(): void {
    const objectFactory = this.objectMetadataToolsFactory;
    const fieldFactory = this.fieldMetadataToolsFactory;

    this.toolExecutorService.registerCategoryGenerator(
      ToolCategory.METADATA,
      async (context) => ({
        ...objectFactory.generateTools(context.workspaceId),
        ...fieldFactory.generateTools(context.workspaceId),
      }),
    );
  }

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.DATA_MODEL,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const toolSet = {
      ...this.objectMetadataToolsFactory.generateTools(context.workspaceId),
      ...this.fieldMetadataToolsFactory.generateTools(context.workspaceId),
    };

    return toolSetToDescriptors(toolSet, ToolCategory.METADATA, {
      includeSchemas: options?.includeSchemas ?? true,
    });
  }
}
