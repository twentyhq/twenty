import { Injectable } from '@nestjs/common';

import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { camelToSnakeCase, isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import {
  type GenerateDescriptorOptions,
  type ToolProvider,
  type ToolProviderContext,
} from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { generateCreateManyRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-many-record-input-schema.util';
import { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
import { generateUpdateManyRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-many-record-input-schema.util';
import { generateUpdateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-record-input-schema.util';
import { DeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/delete-tool.zod-schema';
import { FindOneToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-one-tool.zod-schema';
import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import {
  type ToolDescriptor,
  type ToolIndexEntry,
} from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { isFavoriteRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-favorite-related-object.util';
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
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const includeSchemas = options?.includeSchemas ?? true;
    const descriptors: (ToolIndexEntry | ToolDescriptor)[] = [];

    if (!isDefined(context.userId) || !isDefined(context.userWorkspaceId)) {
      return descriptors;
    }

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
        'rolesPermissions',
      ]);

    const objectPermissions = this.getObjectPermissions(
      rolesPermissions,
      context.rolePermissionConfig,
    );

    if (!objectPermissions) {
      return descriptors;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const allFlatObjects = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((obj) => obj.isActive);

    for (const flatObject of allFlatObjects) {
      if (
        isWorkflowRelatedObject(flatObject) ||
        isFavoriteRelatedObject(flatObject)
      ) {
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

      const restrictedFields = permission.restrictedFields;
      const snakePlural = camelToSnakeCase(objectMetadata.namePlural);
      const snakeSingular = camelToSnakeCase(objectMetadata.nameSingular);

      if (permission.canReadObjectRecords) {
        descriptors.push({
          name: `find_${snakePlural}`,
          description: `Search for ${objectMetadata.labelPlural} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination and orderBy for sorting. To find by ID, use filter: { id: { eq: "record-id" } }. Returns an array of matching records with their full data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: z.toJSONSchema(
              generateFindToolInputSchema(objectMetadata, restrictedFields),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'find',
          },
          objectName: objectMetadata.nameSingular,
          operation: 'find',
        });

        descriptors.push({
          name: `find_one_${snakeSingular}`,
          description: `Retrieve a single ${objectMetadata.labelSingular} record by its unique ID. Use this when you know the exact record ID and need the complete record data. Returns the full record or an error if not found.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: z.toJSONSchema(FindOneToolInputSchema),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'find_one',
          },
          objectName: objectMetadata.nameSingular,
          operation: 'find_one',
        });
      }

      if (permission.canUpdateObjectRecords) {
        descriptors.push({
          name: `create_${snakeSingular}`,
          description: `Create a new ${objectMetadata.labelSingular} record. Provide all required fields and any optional fields you want to set. The system will automatically handle timestamps and IDs. Returns the created record with all its data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: z.toJSONSchema(
              generateCreateRecordInputSchema(objectMetadata, restrictedFields),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'create',
          },
          objectName: objectMetadata.nameSingular,
          operation: 'create',
        });

        descriptors.push({
          name: `create_many_${snakePlural}`,
          description: `Create multiple ${objectMetadata.labelPlural} records in a single call. Provide an array of records, each containing the required fields. Maximum 20 records per call. Returns the created records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: z.toJSONSchema(
              generateCreateManyRecordInputSchema(
                objectMetadata,
                restrictedFields,
              ),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'create_many',
          },
          objectName: objectMetadata.nameSingular,
          operation: 'create_many',
        });

        descriptors.push({
          name: `update_${snakeSingular}`,
          description: `Update an existing ${objectMetadata.labelSingular} record. Provide the record ID and only the fields you want to change. Unspecified fields will remain unchanged. Returns the updated record with all current data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: z.toJSONSchema(
              generateUpdateRecordInputSchema(objectMetadata, restrictedFields),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'update',
          },
          objectName: objectMetadata.nameSingular,
          operation: 'update',
        });

        descriptors.push({
          name: `update_many_${snakePlural}`,
          description: `Update multiple ${objectMetadata.labelPlural} records matching a filter in a single operation. All matching records will receive the same field values. WARNING: Use specific filters to avoid unintended mass updates. Always verify the filter scope with a find query first. Returns the updated records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: z.toJSONSchema(
              generateUpdateManyRecordInputSchema(
                objectMetadata,
                restrictedFields,
              ),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'update_many',
          },
          objectName: objectMetadata.nameSingular,
          operation: 'update_many',
        });
      }

      if (permission.canSoftDeleteObjectRecords) {
        descriptors.push({
          name: `delete_${snakeSingular}`,
          description: `Delete a ${objectMetadata.labelSingular} record by marking it as deleted. The record is hidden from normal queries. This is reversible. Use this to remove records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: z.toJSONSchema(DeleteToolInputSchema),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'delete',
          },
          objectName: objectMetadata.nameSingular,
          operation: 'delete',
        });
      }
    }

    return descriptors;
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
