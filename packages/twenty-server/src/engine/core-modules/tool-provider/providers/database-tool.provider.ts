import { Injectable } from '@nestjs/common';

import {
  type ObjectsPermissions,
  type ObjectsPermissionsByRoleId,
} from 'twenty-shared/types';
import { camelToSnakeCase, isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByAutomation } from 'twenty-shared/workflow';

import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { generateCreateManyRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-many-record-input-schema.util';
import { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
import { generateUpdateManyRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-many-record-input-schema.util';
import { generateUpdateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-record-input-schema.util';
import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { generateBulkDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/bulk-delete-tool.zod-schema';
import { DeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/delete-tool.zod-schema';
import { FindOneToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-one-tool.zod-schema';
import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';
import {
  generateGroupByToolInputSchema,
  hasGroupByToolInputSchema,
} from 'src/engine/core-modules/record-crud/zod-schemas/group-by-tool.zod-schema';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { ToolCategory } from 'twenty-shared/ai';
import z from 'zod';

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

  // Database CRUD tools emit `executionRef.kind === 'database_crud'` descriptors
  // and are dispatched inline by ToolExecutorService. The static-tool path is
  // unreachable for this provider; this method exists only to satisfy the
  // interface.
  async executeStaticTool(
    toolName: string,
    _args: Record<string, unknown>,
    _context: ToolProviderContext,
  ): Promise<ToolOutput> {
    throw new Error(
      `DatabaseToolProvider does not emit static-kind descriptors (tool: ${toolName})`,
    );
  }

  async generateDescriptors(
    context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const includeSchemas = options?.includeSchemas ?? true;
    const toolNames = options?.toolNames;
    const ignorePermissions = options?.ignorePermissions ?? false;
    const descriptors: (ToolIndexEntry | ToolDescriptor)[] = [];

    let objectPermissions: ObjectsPermissions | null = null;

    if (!ignorePermissions) {
      const { rolesPermissions } =
        await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
          'rolesPermissions',
        ]);

      objectPermissions = this.getObjectPermissions(
        rolesPermissions,
        context.rolePermissionConfig,
      );

      if (!objectPermissions) {
        return descriptors;
      }
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const allFlatObjects = getDatabaseCrudToolFlatObjects(
      flatObjectMetadataMaps.byUniversalIdentifier,
    );

    for (const flatObject of allFlatObjects) {
      const permission = objectPermissions?.[flatObject.id];

      if (!ignorePermissions && !permission) {
        continue;
      }

      const snakePlural = camelToSnakeCase(flatObject.namePlural);
      const snakeSingular = camelToSnakeCase(flatObject.nameSingular);

      if (
        isDefined(toolNames) &&
        !this.hasMatchingTool(toolNames, snakeSingular, snakePlural)
      ) {
        continue;
      }

      const fields = includeSchemas
        ? getFlatFieldsFromFlatObjectMetadata(flatObject, flatFieldMetadataMaps)
        : [];

      const objectMetadata = { ...flatObject, fields };

      const restrictedFields = permission?.restrictedFields ?? {};
      const canBeManagedByAutomation = canObjectBeManagedByAutomation({
        nameSingular: objectMetadata.nameSingular,
      });

      const canReadObjectRecords =
        ignorePermissions || permission?.canReadObjectRecords;
      const canWriteObjectRecords =
        ignorePermissions ||
        (permission?.canUpdateObjectRecords && canBeManagedByAutomation);
      const canSoftDeleteObjectRecords =
        ignorePermissions || permission?.canSoftDeleteObjectRecords;

      const shouldIncludeSchema = (name: string) =>
        includeSchemas && (!toolNames || toolNames.has(name));

      if (canReadObjectRecords) {
        descriptors.push({
          name: `find_many_${snakePlural}`,
          description: `Search for ${objectMetadata.labelPlural} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination and orderBy for sorting. Filter fields are top-level arguments — pass each field as its own key (e.g. { id: { eq: "record-id" } }, or { name: { firstName: { ilike: "%ada%" } } }); do NOT wrap them in a "filter" object and do NOT place a bare operator like "ilike"/"eq" at the top level. Combine conditions with and/or/not. Returns an array of matching records with their full data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(shouldIncludeSchema(`find_many_${snakePlural}`) && {
            inputSchema: z.toJSONSchema(
              generateFindToolInputSchema(objectMetadata, restrictedFields),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'find_many',
          },
          objectName: objectMetadata.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'find_many',
        });

        descriptors.push({
          name: `find_one_${snakeSingular}`,
          description: `Retrieve a single ${objectMetadata.labelSingular} by ID.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(shouldIncludeSchema(`find_one_${snakeSingular}`) && {
            inputSchema: z.toJSONSchema(FindOneToolInputSchema),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'find_one',
          },
          objectName: objectMetadata.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'find_one',
        });

        const groupByName = `group_by_${snakePlural}`;
        const shouldGenerateGroupBy = shouldIncludeSchema(groupByName);
        const groupBySchema = shouldGenerateGroupBy
          ? generateGroupByToolInputSchema(objectMetadata, restrictedFields)
          : null;

        const hasGroupBySchema =
          !includeSchemas ||
          groupBySchema !== null ||
          hasGroupByToolInputSchema(objectMetadata, restrictedFields);

        if (hasGroupBySchema) {
          descriptors.push({
            name: groupByName,
            description: `Group ${objectMetadata.labelPlural} records by one or two fields and compute an aggregate (COUNT, SUM, AVG, MIN, MAX, etc.). Use for questions like "how many deals per stage?" or "total revenue by company". Returns groups with dimension values and aggregate results, ordered by the aggregate value.`,
            category: ToolCategory.DATABASE_CRUD,
            ...(shouldGenerateGroupBy &&
              groupBySchema && {
                inputSchema: toToolJsonSchema(groupBySchema),
              }),
            executionRef: {
              kind: 'database_crud',
              objectNameSingular: objectMetadata.nameSingular,
              operation: 'group_by',
            },
            objectName: objectMetadata.nameSingular,
            icon: flatObject.icon ?? undefined,
            operation: 'group_by',
          });
        }
      }

      if (canWriteObjectRecords) {
        descriptors.push({
          name: `create_one_${snakeSingular}`,
          description: `Create a new ${objectMetadata.labelSingular} record. Provide all required fields and any optional fields you want to set. The system will automatically handle timestamps and IDs. Returns the created record with all its data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(shouldIncludeSchema(`create_one_${snakeSingular}`) && {
            inputSchema: z.toJSONSchema(
              generateCreateRecordInputSchema(objectMetadata, restrictedFields),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'create_one',
          },
          objectName: objectMetadata.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'create_one',
        });

        descriptors.push({
          name: `create_many_${snakePlural}`,
          description: `Create multiple ${objectMetadata.labelPlural} records in a single call. Provide an array of records, each containing the required fields. Maximum 20 records per call. Returns the created records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(shouldIncludeSchema(`create_many_${snakePlural}`) && {
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
          icon: flatObject.icon ?? undefined,
          operation: 'create_many',
        });

        descriptors.push({
          name: `update_one_${snakeSingular}`,
          description: `Update an existing ${objectMetadata.labelSingular} record. Provide the record ID and only the fields you want to change. Unspecified fields will remain unchanged. Returns the updated record with all current data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(shouldIncludeSchema(`update_one_${snakeSingular}`) && {
            inputSchema: z.toJSONSchema(
              generateUpdateRecordInputSchema(objectMetadata, restrictedFields),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'update_one',
          },
          objectName: objectMetadata.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'update_one',
        });

        descriptors.push({
          name: `update_many_${snakePlural}`,
          description: `Apply the SAME field values to all ${objectMetadata.labelPlural} records matching a filter. Use when every matched record gets identical changes (e.g. bulk status change). For records that each have different data to update, use upsert_many_${snakePlural} instead. WARNING: Use specific filters to avoid unintended mass updates. Always verify the filter scope with a find query first.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(shouldIncludeSchema(`update_many_${snakePlural}`) && {
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
          icon: flatObject.icon ?? undefined,
          operation: 'update_many',
        });

        descriptors.push({
          name: `upsert_many_${snakePlural}`,
          description: `Insert or update multiple ${objectMetadata.labelPlural} records in a single call, where each record has its own individual data. Use this instead of update_many_${snakePlural} when records need different field values. Existing records are matched by unique fields and updated; records with no match are created. Maximum 20 records per call. Returns the upserted records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(shouldIncludeSchema(`upsert_many_${snakePlural}`) && {
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
            operation: 'upsert_many',
          },
          objectName: objectMetadata.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'upsert_many',
        });
      }

      if (canSoftDeleteObjectRecords) {
        descriptors.push({
          name: `delete_one_${snakeSingular}`,
          description: `Delete a ${objectMetadata.labelSingular} record by marking it as deleted. The record is hidden from normal queries. This is reversible. Use this to remove records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: toToolJsonSchema(DeleteToolInputSchema),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'delete_one',
          },
          objectName: objectMetadata.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'delete_one',
        });

        descriptors.push({
          name: `delete_many_${snakePlural}`,
          description: `Soft-delete multiple ${objectMetadata.labelPlural} records matching a filter in a single operation. Deleted records are hidden from normal queries and the operation is reversible. WARNING: Use specific filters to avoid unintended mass deletions.`,
          category: ToolCategory.DATABASE_CRUD,
          ...(includeSchemas && {
            inputSchema: toToolJsonSchema(
              generateBulkDeleteToolInputSchema(
                objectMetadata,
                restrictedFields,
              ),
            ),
          }),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: objectMetadata.nameSingular,
            operation: 'delete_many',
          },
          objectName: objectMetadata.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'delete_many',
        });
      }
    }

    return descriptors;
  }

  private hasMatchingTool(
    toolNames: Set<string>,
    snakeSingular: string,
    snakePlural: string,
  ): boolean {
    return (
      toolNames.has(`find_many_${snakePlural}`) ||
      toolNames.has(`find_one_${snakeSingular}`) ||
      toolNames.has(`group_by_${snakePlural}`) ||
      toolNames.has(`create_one_${snakeSingular}`) ||
      toolNames.has(`create_many_${snakePlural}`) ||
      toolNames.has(`update_one_${snakeSingular}`) ||
      toolNames.has(`update_many_${snakePlural}`) ||
      toolNames.has(`delete_one_${snakeSingular}`) ||
      toolNames.has(`delete_many_${snakePlural}`) ||
      toolNames.has(`upsert_many_${snakePlural}`)
    );
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
