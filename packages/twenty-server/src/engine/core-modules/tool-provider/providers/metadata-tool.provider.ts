import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';

import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { FieldMetadataToolsFactory } from 'src/engine/metadata-modules/field-metadata/tools/field-metadata-tools.factory';
import { ObjectMetadataToolsFactory } from 'src/engine/metadata-modules/object-metadata/tools/object-metadata-tools.factory';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';

@Injectable()
export class MetadataToolProvider implements ToolProvider {
  readonly category = ToolCategory.METADATA;

  constructor(
    private readonly objectMetadataToolsFactory: ObjectMetadataToolsFactory,
    private readonly fieldMetadataToolsFactory: FieldMetadataToolsFactory,
    private readonly permissionsService: PermissionsService,
  ) {}

  async isAvailable(context: ToolProviderContext): Promise<boolean> {
    return this.permissionsService.checkRolesPermissions(
      context.rolePermissionConfig,
      context.workspaceId,
      PermissionFlagType.DATA_MODEL,
    );
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    return {
      ...this.objectMetadataToolsFactory.generateTools(context.workspaceId),
      ...this.fieldMetadataToolsFactory.generateTools(context.workspaceId),
    };
  }
}
