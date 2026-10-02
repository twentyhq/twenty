import { Injectable } from '@nestjs/common';

import * as Sentry from '@sentry/node';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { camelToSnakeCase, isDefined } from 'twenty-shared/utils';
import { canObjectBeManagedByAutomation } from 'twenty-shared/workflow';
import { type z } from 'zod';

import { I18nService } from 'src/engine/core-modules/i18n/i18n.service';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { getCrudToolLabels } from 'src/engine/core-modules/tool-provider/utils/get-crud-tool-label.util';
import { resolveEffectiveFieldDescription } from 'src/engine/core-modules/tool-provider/utils/resolve-effective-field-description.util';
import {
  ToolSchemaLocalCache,
  type ToolSchemaStore,
} from 'src/engine/core-modules/tool-provider/utils/tool-schema-local-cache.util';
import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
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
import { type FlatObjectPermission } from 'src/engine/metadata-modules/flat-object-permission/types/flat-object-permission.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { getObjectsPermissionsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-objects-permissions-from-role-permission-config.util';
import { getRoleIdsFromRolePermissionConfig } from 'src/engine/twenty-orm/utils/get-role-ids-from-role-permission-config.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { combineCacheHashes } from 'src/engine/workspace-cache/utils/combine-cache-hashes.util';
import { RECORDS_TOOL_WIDGET_NAME, ToolCategory } from 'twenty-shared/ai';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Schemas are pure functions of the object and field metadata, so they are cached against its hash
const SCHEMA_METADATA_CACHE_KEYS = [
  'flatObjectMetadataMaps',
  'flatFieldMetadataMaps',
] as const;
// Serialized size; a ~60 objects / ~1,500 fields workspace weighs a few MB
const SCHEMA_CACHE_MAX_SIZE_BYTES = 64 * 1024 * 1024;
const SCHEMA_CACHE_IDLE_TTL_MS = 30 * 60 * 1000;

type InputSchemaGenerator = (
  objectMetadata: ObjectMetadataForToolSchema,
) => z.ZodTypeAny | null;

@Injectable()
export class DatabaseToolProvider implements ToolProvider {
  readonly category = ToolCategory.DATABASE_CRUD;

  private readonly schemaCache = new ToolSchemaLocalCache({
    maxSizeBytes: SCHEMA_CACHE_MAX_SIZE_BYTES,
    idleTtlMs: SCHEMA_CACHE_IDLE_TTL_MS,
  });

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly i18nService: I18nService,
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  // Unreachable: database CRUD descriptors are dispatched inline by ToolExecutorService.
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
    const descriptors: (ToolIndexEntry | ToolDescriptor)[] = [];

    const { rolesPermissions, flatObjectPermissionMaps } =
      await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
        'rolesPermissions',
        'flatObjectPermissionMaps',
      ]);

    const objectPermissions = getObjectsPermissionsFromRolePermissionConfig({
      rolesPermissions,
      rolePermissionConfig: context.rolePermissionConfig,
    });

    if (Object.keys(objectPermissions).length === 0) {
      return descriptors;
    }

    const requireExplicitObjectGrants =
      context.requireExplicitObjectGrants === true;

    const roleId = getRoleIdsFromRolePermissionConfig(
      context.rolePermissionConfig,
    )[0];

    const explicitPermissionByObjectId = new Map<
      string,
      FlatObjectPermission
    >();

    if (requireExplicitObjectGrants) {
      for (const flatObjectPermission of Object.values(
        flatObjectPermissionMaps.byUniversalIdentifier,
      )) {
        if (
          isDefined(flatObjectPermission) &&
          flatObjectPermission.roleId === roleId
        ) {
          explicitPermissionByObjectId.set(
            flatObjectPermission.objectMetadataId,
            flatObjectPermission,
          );
        }
      }
    }

    const {
      data: { flatObjectMetadataMaps, flatFieldMetadataMaps },
      hashes,
    } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMapsWithHashes(
        {
          workspaceId: context.workspaceId,
          flatMapsKeys: [...SCHEMA_METADATA_CACHE_KEYS],
        },
      );

    const allFlatObjects = getDatabaseCrudToolFlatObjects(
      flatObjectMetadataMaps.byUniversalIdentifier,
    );

    const { resolveFields, schemaStore } = includeSchemas
      ? await this.buildSchemaResolver({
          context,
          flatFieldMetadataMaps,
          metadataHash: combineCacheHashes(hashes, SCHEMA_METADATA_CACHE_KEYS),
        })
      : { resolveFields: () => [], schemaStore: undefined };

    let schemaRequestCount = 0;
    let schemaCacheMissCount = 0;

    for (const flatObject of allFlatObjects) {
      const schemaCacheMissCountBeforeObject = schemaCacheMissCount;
      const permission = objectPermissions[flatObject.id];
      const explicitPermission = explicitPermissionByObjectId.get(
        flatObject.id,
      );

      if (
        !permission ||
        (requireExplicitObjectGrants && !isDefined(explicitPermission))
      ) {
        continue;
      }

      const canReadRecords = requireExplicitObjectGrants
        ? explicitPermission?.canReadObjectRecords === true
        : permission.canReadObjectRecords;
      const canUpdateRecords = requireExplicitObjectGrants
        ? explicitPermission?.canUpdateObjectRecords === true
        : permission.canUpdateObjectRecords;
      const canSoftDeleteRecords = requireExplicitObjectGrants
        ? explicitPermission?.canSoftDeleteObjectRecords === true
        : permission.canSoftDeleteObjectRecords;

      const snakePlural = camelToSnakeCase(flatObject.namePlural);
      const snakeSingular = camelToSnakeCase(flatObject.nameSingular);

      if (
        isDefined(toolNames) &&
        !this.hasMatchingTool(toolNames, snakeSingular, snakePlural)
      ) {
        continue;
      }

      let objectMetadataWithFields: ObjectMetadataForToolSchema | undefined;

      const getObjectMetadata = (): ObjectMetadataForToolSchema => {
        objectMetadataWithFields ??= {
          ...flatObject,
          fields: resolveFields(flatObject),
        };

        return objectMetadataWithFields;
      };

      const restrictedFields = permission.restrictedFields;
      const canBeManagedByAutomation = canObjectBeManagedByAutomation({
        nameSingular: flatObject.nameSingular,
      });

      // undefined when the schema was not requested, null when the tool has no valid schema
      const getInputSchema = (
        name: string,
        generateInputSchema: InputSchemaGenerator,
      ): object | null | undefined => {
        if (
          !isDefined(schemaStore) ||
          (isDefined(toolNames) && !toolNames.has(name))
        ) {
          return undefined;
        }

        schemaRequestCount++;

        return schemaStore.getOrCompute(
          `${name}:${JSON.stringify(restrictedFields ?? {})}`,
          () => {
            schemaCacheMissCount++;

            const zodSchema = generateInputSchema(getObjectMetadata());

            return isDefined(zodSchema) ? toToolJsonSchema(zodSchema) : null;
          },
        );
      };

      const withInputSchema = (
        name: string,
        generateInputSchema: InputSchemaGenerator,
      ): { inputSchema?: object } => {
        const inputSchema = getInputSchema(name, generateInputSchema);

        return isDefined(inputSchema) ? { inputSchema } : {};
      };

      if (canReadRecords) {
        descriptors.push({
          name: `find_many_${snakePlural}`,
          ...getCrudToolLabels(
            'find_many',
            flatObject.labelPlural,
            this.i18nService,
            context.locale,
          ),
          description: `Search for ${flatObject.labelPlural} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination and orderBy for sorting. Filter fields are top-level arguments — pass each field as its own key (e.g. { id: { eq: "record-id" } }; composite fields take their sub-field: { <field>: { <subField>: { ilike: "%ada%" } } }); do NOT wrap them in a "filter" object and do NOT place a bare operator like "ilike"/"eq" at the top level. Combine conditions with and/or/not. Returns an array of matching records with their full data, plus a "count" of total matches and a "hasNextPage" flag. When "hasNextPage" is true, more records match than were returned: continue with a higher offset (or increase the limit) before concluding a record is absent or answering count/enumeration questions.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(`find_many_${snakePlural}`, (objectMetadata) =>
            generateFindToolInputSchema(objectMetadata, restrictedFields),
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'find_many',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'find_many',
        });

        descriptors.push({
          name: `find_one_${snakeSingular}`,
          ...getCrudToolLabels(
            'find_one',
            flatObject.labelSingular,
            this.i18nService,
            context.locale,
          ),
          description: `Retrieve a single ${flatObject.labelSingular} by ID.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(
            `find_one_${snakeSingular}`,
            () => FindOneToolInputSchema,
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'find_one',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'find_one',
        });

        const groupByName = `group_by_${snakePlural}`;
        const groupBySchema = getInputSchema(groupByName, (objectMetadata) =>
          generateGroupByToolInputSchema(objectMetadata, restrictedFields),
        );

        const hasGroupBySchema =
          !includeSchemas ||
          isDefined(groupBySchema) ||
          (groupBySchema === undefined &&
            hasGroupByToolInputSchema(getObjectMetadata(), restrictedFields));

        if (hasGroupBySchema) {
          descriptors.push({
            name: groupByName,
            ...getCrudToolLabels(
              'group_by',
              flatObject.labelPlural,
              this.i18nService,
              context.locale,
            ),
            description: `Group ${flatObject.labelPlural} records by one or two fields and compute an aggregate (COUNT, SUM, AVG, MIN, MAX, etc.). Use for questions like "how many deals per stage?" or "total revenue by company". Returns groups with dimension values and aggregate results, ordered by the aggregate value.`,
            category: ToolCategory.DATABASE_CRUD,
            ...(isDefined(groupBySchema) && { inputSchema: groupBySchema }),
            executionRef: {
              kind: 'database_crud',
              objectNameSingular: flatObject.nameSingular,
              operation: 'group_by',
            },
            objectName: flatObject.nameSingular,
            icon: flatObject.icon ?? undefined,
            operation: 'group_by',
          });
        }
      }

      if (canUpdateRecords && canBeManagedByAutomation) {
        descriptors.push({
          name: `create_one_${snakeSingular}`,
          ...getCrudToolLabels(
            'create_one',
            flatObject.labelSingular,
            this.i18nService,
            context.locale,
          ),
          description: `Create a new ${flatObject.labelSingular} record. Provide all required fields and any optional fields you want to set. The system will automatically handle timestamps and IDs. Returns the created record with all its data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(`create_one_${snakeSingular}`, (objectMetadata) =>
            generateCreateRecordInputSchema(objectMetadata, restrictedFields),
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'create_one',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'create_one',
        });

        descriptors.push({
          name: `create_many_${snakePlural}`,
          ...getCrudToolLabels(
            'create_many',
            flatObject.labelPlural,
            this.i18nService,
            context.locale,
          ),
          description: `Create multiple ${flatObject.labelPlural} records in a single call. Provide an array of records, each containing the required fields. Maximum 20 records per call. Returns the created records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(`create_many_${snakePlural}`, (objectMetadata) =>
            generateCreateManyRecordInputSchema(
              objectMetadata,
              restrictedFields,
            ),
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'create_many',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'create_many',
        });

        descriptors.push({
          name: `update_one_${snakeSingular}`,
          ...getCrudToolLabels(
            'update_one',
            flatObject.labelSingular,
            this.i18nService,
            context.locale,
          ),
          description: `Update an existing ${flatObject.labelSingular} record. Provide the record ID and only the fields you want to change. Unspecified fields will remain unchanged. Returns the updated record with all current data.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(`update_one_${snakeSingular}`, (objectMetadata) =>
            generateUpdateRecordInputSchema(objectMetadata, restrictedFields),
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'update_one',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'update_one',
        });

        descriptors.push({
          name: `update_many_${snakePlural}`,
          ...getCrudToolLabels(
            'update_many',
            flatObject.labelPlural,
            this.i18nService,
            context.locale,
          ),
          description: `Apply the SAME field values to all ${flatObject.labelPlural} records matching a filter. Use when every matched record gets identical changes (e.g. bulk status change). For records that each have different data to update, use upsert_many_${snakePlural} instead. WARNING: Use specific filters to avoid unintended mass updates. Always verify the filter scope with a find query first.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(`update_many_${snakePlural}`, (objectMetadata) =>
            generateUpdateManyRecordInputSchema(
              objectMetadata,
              restrictedFields,
            ),
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'update_many',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'update_many',
        });

        descriptors.push({
          name: `upsert_many_${snakePlural}`,
          ...getCrudToolLabels(
            'upsert_many',
            flatObject.labelPlural,
            this.i18nService,
            context.locale,
          ),
          description: `Insert or update multiple ${flatObject.labelPlural} records in a single call, where each record has its own individual data. Use this instead of update_many_${snakePlural} when records need different field values. Existing records are matched by unique fields and updated; records with no match are created. Maximum 20 records per call. Returns the upserted records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(`upsert_many_${snakePlural}`, (objectMetadata) =>
            generateCreateManyRecordInputSchema(
              objectMetadata,
              restrictedFields,
            ),
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'upsert_many',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'upsert_many',
        });
      }

      if (canSoftDeleteRecords) {
        descriptors.push({
          name: `delete_one_${snakeSingular}`,
          ...getCrudToolLabels(
            'delete_one',
            flatObject.labelSingular,
            this.i18nService,
            context.locale,
          ),
          description: `Delete a ${flatObject.labelSingular} record by marking it as deleted. The record is hidden from normal queries. This is reversible. Use this to remove records.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(
            `delete_one_${snakeSingular}`,
            () => DeleteToolInputSchema,
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'delete_one',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'delete_one',
        });

        descriptors.push({
          name: `delete_many_${snakePlural}`,
          ...getCrudToolLabels(
            'delete_many',
            flatObject.labelPlural,
            this.i18nService,
            context.locale,
          ),
          description: `Soft-delete multiple ${flatObject.labelPlural} records matching a filter in a single operation. Deleted records are hidden from normal queries and the operation is reversible. WARNING: Use specific filters to avoid unintended mass deletions.`,
          category: ToolCategory.DATABASE_CRUD,
          ...withInputSchema(`delete_many_${snakePlural}`, (objectMetadata) =>
            generateBulkDeleteToolInputSchema(objectMetadata, restrictedFields),
          ),
          executionRef: {
            kind: 'database_crud',
            objectNameSingular: flatObject.nameSingular,
            operation: 'delete_many',
          },
          objectName: flatObject.nameSingular,
          icon: flatObject.icon ?? undefined,
          operation: 'delete_many',
        });
      }

      // Generating one object's schemas takes tens of ms on large objects; yield so a
      // cold cache does not stall every other request on the event loop
      if (schemaCacheMissCount > schemaCacheMissCountBeforeObject) {
        await new Promise((resolve) => setImmediate(resolve));
      }
    }

    if (includeSchemas) {
      Sentry.getActiveSpan()?.setAttributes({
        'tool.schema_cache.request_count': schemaRequestCount,
        'tool.schema_cache.miss_count': schemaCacheMissCount,
      });
    }

    // group_by answers with aggregates, not the recordReferences the records widget links.
    return descriptors.map((descriptor) =>
      descriptor.operation === 'group_by'
        ? descriptor
        : { ...descriptor, widgetName: RECORDS_TOOL_WIDGET_NAME },
    );
  }

  private async buildSchemaResolver({
    context,
    flatFieldMetadataMaps,
    metadataHash,
  }: {
    context: ToolProviderContext;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    metadataHash: string;
  }): Promise<{
    resolveFields: (flatObject: FlatObjectMetadata) => FlatFieldMetadata[];
    schemaStore: ToolSchemaStore;
  }> {
    const locale = context.locale ?? SOURCE_LOCALE;
    const i18nInstance = this.i18nService.getI18nInstance(locale);

    const { workspaceCustomApplicationUniversalIdentifier } =
      await this.applicationTranslationCatalogService.getApplicationAuthorIdentifiers(
        {
          workspaceId: context.workspaceId,
          workspaceCustomApplicationId:
            context.authContext?.workspace.workspaceCustomApplicationId,
        },
      );

    const workspaceSchemaStore = this.schemaCache.getStore(
      context.workspaceId,
      `${metadataHash}:${workspaceCustomApplicationUniversalIdentifier}`,
    );

    // Field descriptions are translated, so each locale gets its own schemas
    const schemaStore: ToolSchemaStore = {
      getOrCompute: (key, compute) =>
        workspaceSchemaStore.getOrCompute(`${locale}:${key}`, compute),
    };

    return {
      resolveFields: (flatObject) =>
        getFlatFieldsFromFlatObjectMetadata(
          flatObject,
          flatFieldMetadataMaps,
        ).map((flatFieldMetadata) => ({
          ...flatFieldMetadata,
          description: resolveEffectiveFieldDescription({
            flatFieldMetadata,
            locale: context.locale,
            i18nInstance,
            workspaceCustomApplicationUniversalIdentifier,
          }),
        })),
      schemaStore,
    };
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
}
