import { Injectable, Logger } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { isDefined } from 'twenty-shared/utils';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import {
  type ObjectWithPermission,
  type ToolFactory,
  type ToolGeneratorContext,
} from 'src/engine/core-modules/tool-generator/types/tool-generator.types';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class PerObjectToolGeneratorService {
  private readonly logger = new Logger(PerObjectToolGeneratorService.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
  ) {}

  // Generate tools by iterating over workspace objects once and applying all factories
  async generate(
    context: ToolGeneratorContext,
    factories: ToolFactory[],
  ): Promise<ToolSet> {
    const objects = await this.getObjectsWithPermissions(
      context.workspaceId,
      context.rolePermissionConfig,
    );

    const tools: ToolSet = {};

    for (const objectWithPermission of objects) {
      for (const factory of factories) {
        Object.assign(tools, factory(objectWithPermission, context));
      }
    }

    this.logger.log(
      `Generated ${Object.keys(tools).length} tools from ${factories.length} factories for ${objects.length} objects`,
    );

    return tools;
  }

  // Get workspace objects with their permissions
  async getObjectsWithPermissions(
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
  ): Promise<ObjectWithPermission[]> {
    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    let objectPermissions;

    if ('unionOf' in rolePermissionConfig) {
      if (rolePermissionConfig.unionOf.length === 1) {
        objectPermissions = rolesPermissions[rolePermissionConfig.unionOf[0]];
      } else {
        throw new Error(
          'Union permission logic for multiple roles not yet implemented',
        );
      }
    } else if ('intersectionOf' in rolePermissionConfig) {
      const allRolePermissions = rolePermissionConfig.intersectionOf.map(
        (roleId: string) => rolesPermissions[roleId],
      );

      objectPermissions =
        allRolePermissions.length === 1
          ? allRolePermissions[0]
          : computePermissionIntersection(allRolePermissions);
    } else {
      return [];
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const allFlatObjects = Object.values(flatObjectMetadataMaps.byId)
      .filter(isDefined)
      .filter((obj) => obj.isActive && !obj.isSystem);

    const allObjectMetadata = allFlatObjects.map((flatObject) => ({
      ...flatObject,
      fields: getFlatFieldsFromFlatObjectMetadata(
        flatObject,
        flatFieldMetadataMaps,
      ),
    }));

    // Filter out workflow-related objects
    const filteredObjectMetadata = allObjectMetadata.filter(
      (objectMetadata) => !isWorkflowRelatedObject(objectMetadata),
    );

    // Map to ObjectWithPermission
    const result: ObjectWithPermission[] = [];

    for (const objectMetadata of filteredObjectMetadata) {
      const permission = objectPermissions[objectMetadata.id];

      if (!permission) {
        continue;
      }

      result.push({
        objectMetadata,
        restrictedFields: permission.restrictedFields,
        canCreate: permission.canUpdateObjectRecords,
        canRead: permission.canReadObjectRecords,
        canUpdate: permission.canUpdateObjectRecords,
        canDelete: permission.canSoftDeleteObjectRecords,
      });
    }

    return result;
  }
}
