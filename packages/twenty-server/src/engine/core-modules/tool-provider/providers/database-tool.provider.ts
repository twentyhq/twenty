import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';
import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/api/common/interfaces/workspace-auth-context.interface';
import {
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { createDirectRecordToolsFactory } from 'src/engine/core-modules/record-crud/tool-factory/direct-record-tools.factory';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class DatabaseToolProvider implements ToolProvider {
  readonly category = ToolCategory.DATABASE_CRUD;

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly deleteRecordService: DeleteRecordService,
    private readonly findRecordsService: FindRecordsService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    // Database tools are always available (per-object permissions checked in generateTools)
    return true;
  }

  async generateTools(context: ToolProviderContext): Promise<ToolSet> {
    const tools: ToolSet = {};

    // Build authContext from available context info
    // userWorkspaceId is required for user-based tool generation
    if (!context.userWorkspaceId) {
      return tools;
    }

    const authContext: WorkspaceAuthContext = {
      user: context.userId ? { id: context.userId } : null,
      workspace: {
        id: context.workspaceId,
      } as WorkspaceAuthContext['workspace'],
      workspaceMemberId: undefined,
      userWorkspaceId: context.userWorkspaceId,
      apiKey: null,
      application: null,
    } as WorkspaceAuthContext;

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
        'rolesPermissions',
      ]);

    const objectPermissions = this.getObjectPermissions(
      rolesPermissions,
      context.rolePermissionConfig,
    );

    if (!objectPermissions) {
      return tools;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const allFlatObjects = Object.values(flatObjectMetadataMaps.byId)
      .filter(isDefined)
      .filter((obj) => obj.isActive && !obj.isSystem);

    const factory = createDirectRecordToolsFactory({
      createRecordService: this.createRecordService,
      updateRecordService: this.updateRecordService,
      deleteRecordService: this.deleteRecordService,
      findRecordsService: this.findRecordsService,
    });

    for (const flatObject of allFlatObjects) {
      if (isWorkflowRelatedObject(flatObject)) {
        continue;
      }

      const permission = objectPermissions[flatObject.id];

      if (!permission) {
        continue;
      }

      const objectMetadata = {
        ...flatObject,
        fields: getFlatFieldsFromFlatObjectMetadata(
          flatObject,
          flatFieldMetadataMaps,
        ),
      };

      const objectTools = factory(
        {
          objectMetadata,
          restrictedFields: permission.restrictedFields,
          canCreate: permission.canUpdateObjectRecords,
          canRead: permission.canReadObjectRecords,
          canUpdate: permission.canUpdateObjectRecords,
          canDelete: permission.canSoftDeleteObjectRecords,
        },
        {
          workspaceId: context.workspaceId,
          authContext,
          rolePermissionConfig: context.rolePermissionConfig,
          actorContext: context.actorContext,
        },
      );

      Object.assign(tools, objectTools);
    }

    return tools;
  }

  private getObjectPermissions(
    rolesPermissions: ObjectsPermissionsByRoleId,
    rolePermissionConfig: ToolProviderContext['rolePermissionConfig'],
  ): ObjectsPermissions | null {
    if ('intersectionOf' in rolePermissionConfig) {
      const allRolePermissions = rolePermissionConfig.intersectionOf.map(
        (roleId: string) => rolesPermissions[roleId],
      );

      return allRolePermissions.length === 1
        ? allRolePermissions[0]
        : computePermissionIntersection(allRolePermissions);
    }

    if ('unionOf' in rolePermissionConfig) {
      if (rolePermissionConfig.unionOf.length === 1) {
        return rolesPermissions[rolePermissionConfig.unionOf[0]];
      }

      throw new Error(
        'Union permission logic for multiple roles not yet implemented',
      );
    }

    return null;
  }
}
