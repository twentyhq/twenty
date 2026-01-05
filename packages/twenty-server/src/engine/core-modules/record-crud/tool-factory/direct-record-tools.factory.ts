import { type ToolSet } from 'ai';

import { type CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { type DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { type FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
import { generateUpdateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-record-input-schema.util';
import { FindOneToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-one-tool.zod-schema';
import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';
import { SoftDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/soft-delete-tool.zod-schema';
import {
  type ObjectWithPermission,
  type ToolGeneratorContext,
} from 'src/engine/core-modules/tool-generator/types/tool-generator.types';

// Dependencies required by the direct record tools factory
export type DirectRecordToolsDeps = {
  createRecordService: CreateRecordService;
  updateRecordService: UpdateRecordService;
  deleteRecordService: DeleteRecordService;
  findRecordsService: FindRecordsService;
};

export const createDirectRecordToolsFactory = (deps: DirectRecordToolsDeps) => {
  return (
    {
      objectMetadata,
      restrictedFields,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
    }: ObjectWithPermission,
    context: ToolGeneratorContext,
  ): ToolSet => {
    const tools: ToolSet = {};

    // Skip generating tools if no auth context is provided
    if (!context.authContext) {
      return tools;
    }

    // Capture authContext in a constant for use in async callbacks
    const authContext = context.authContext;

    if (canRead) {
      tools[`find_${objectMetadata.namePlural}`] = {
        description: `Search for ${objectMetadata.labelPlural} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination and orderBy for sorting. To find by ID, use filter: { id: { eq: "record-id" } }. Returns an array of matching records with their full data.`,
        inputSchema: generateFindToolInputSchema(
          objectMetadata,
          restrictedFields,
        ),
        execute: async (parameters) => {
          const {
            loadingMessage: _,
            limit,
            offset,
            orderBy,
            ...filter
          } = parameters;

          return deps.findRecordsService.execute({
            objectName: objectMetadata.nameSingular,
            filter,
            orderBy,
            limit,
            offset,
            authContext,
            rolePermissionConfig: context.rolePermissionConfig,
          });
        },
      };

      tools[`find_one_${objectMetadata.nameSingular}`] = {
        description: `Retrieve a single ${objectMetadata.labelSingular} record by its unique ID. Use this when you know the exact record ID and need the complete record data. Returns the full record or an error if not found.`,
        inputSchema: FindOneToolInputSchema,
        execute: async (parameters) => {
          return deps.findRecordsService.execute({
            objectName: objectMetadata.nameSingular,
            filter: { id: { eq: parameters.id } },
            limit: 1,
            authContext,
            rolePermissionConfig: context.rolePermissionConfig,
          });
        },
      };
    }

    if (canCreate) {
      tools[`create_${objectMetadata.nameSingular}`] = {
        description: `Create a new ${objectMetadata.labelSingular} record. Provide all required fields and any optional fields you want to set. The system will automatically handle timestamps and IDs. Returns the created record with all its data.`,
        inputSchema: generateCreateRecordInputSchema(
          objectMetadata,
          restrictedFields,
        ),
        execute: async (parameters) => {
          const { loadingMessage: _, ...objectRecord } = parameters;

          return deps.createRecordService.execute({
            objectName: objectMetadata.nameSingular,
            objectRecord,
            authContext,
            rolePermissionConfig: context.rolePermissionConfig,
            createdBy: context.actorContext,
          });
        },
      };
    }

    if (canUpdate) {
      tools[`update_${objectMetadata.nameSingular}`] = {
        description: `Update an existing ${objectMetadata.labelSingular} record. Provide the record ID and only the fields you want to change. Unspecified fields will remain unchanged. Returns the updated record with all current data.`,
        inputSchema: generateUpdateRecordInputSchema(
          objectMetadata,
          restrictedFields,
        ),
        execute: async (parameters) => {
          const { loadingMessage: _, id, ...allFields } = parameters;

          const objectRecord = Object.fromEntries(
            Object.entries(allFields).filter(
              ([, value]) => value !== undefined,
            ),
          );

          return deps.updateRecordService.execute({
            objectName: objectMetadata.nameSingular,
            objectRecordId: id,
            objectRecord,
            authContext,
            rolePermissionConfig: context.rolePermissionConfig,
          });
        },
      };
    }

    if (canDelete) {
      tools[`soft_delete_${objectMetadata.nameSingular}`] = {
        description: `Soft delete a ${objectMetadata.labelSingular} record by marking it as deleted. The record remains in the database but is hidden from normal queries. This is reversible and preserves all data. Use this for temporary removal.`,
        inputSchema: SoftDeleteToolInputSchema,
        execute: async (parameters) => {
          return deps.deleteRecordService.execute({
            objectName: objectMetadata.nameSingular,
            objectRecordId: parameters.id,
            authContext,
            rolePermissionConfig: context.rolePermissionConfig,
            soft: true,
          });
        },
      };
    }

    return tools;
  };
};
