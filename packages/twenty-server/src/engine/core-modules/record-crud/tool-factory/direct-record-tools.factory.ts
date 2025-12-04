import { type ToolSet } from 'ai';

import { type CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { type DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { type FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { type UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { generateCreateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-create-record-input-schema.util';
import { generateUpdateRecordInputSchema } from 'src/engine/core-modules/record-crud/utils/generate-update-record-input-schema.util';
import { BulkDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/bulk-delete-tool.zod-schema';
import { FindOneToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-one-tool.zod-schema';
import { generateFindToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/find-tool.zod-schema';
import { SoftDeleteToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/soft-delete-tool.zod-schema';
import {
  type ObjectWithPermission,
  type ToolGeneratorContext,
} from 'src/engine/core-modules/tool-generator/types/tool-generator.types';
import { type TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

// Dependencies required by the direct record tools factory
export type DirectRecordToolsDeps = {
  createRecordService: CreateRecordService;
  updateRecordService: UpdateRecordService;
  deleteRecordService: DeleteRecordService;
  findRecordsService: FindRecordsService;
  twentyORMGlobalManager: TwentyORMGlobalManager;
};

// Creates the factory function with injected dependencies
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

    if (canRead) {
      tools[`find_${objectMetadata.nameSingular}`] = {
        description: `Search for ${objectMetadata.labelSingular} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination and orderBy for sorting. To find by ID, use filter: { id: { eq: "record-id" } }. Returns an array of matching records with their full data.`,
        inputSchema: generateFindToolInputSchema(
          objectMetadata,
          restrictedFields,
        ),
        execute: async (parameters) => {
          const { limit, offset, orderBy, ...filter } = parameters.input;

          return deps.findRecordsService.execute({
            objectName: objectMetadata.nameSingular,
            filter,
            orderBy,
            limit,
            offset,
            workspaceId: context.workspaceId,
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
            filter: { id: { eq: parameters.input.id } },
            limit: 1,
            workspaceId: context.workspaceId,
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
          return deps.createRecordService.execute({
            objectName: objectMetadata.nameSingular,
            objectRecord: parameters.input,
            workspaceId: context.workspaceId,
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
          const { id, ...allFields } = parameters.input;

          const objectRecord = Object.fromEntries(
            Object.entries(allFields).filter(
              ([, value]) => value !== undefined,
            ),
          );

          return deps.updateRecordService.execute({
            objectName: objectMetadata.nameSingular,
            objectRecordId: id,
            objectRecord,
            workspaceId: context.workspaceId,
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
            objectRecordId: parameters.input.id,
            workspaceId: context.workspaceId,
            rolePermissionConfig: context.rolePermissionConfig,
            soft: true,
          });
        },
      };

      tools[`soft_delete_many_${objectMetadata.nameSingular}`] = {
        description: `Soft delete multiple ${objectMetadata.labelSingular} records at once by providing an array of record IDs. All records are marked as deleted but remain in the database. This is efficient for bulk operations and preserves all data.`,
        inputSchema: BulkDeleteToolInputSchema,
        execute: async (parameters) => {
          return softDeleteManyRecords(
            deps.twentyORMGlobalManager,
            objectMetadata.nameSingular,
            parameters.input,
            context.workspaceId,
            context.rolePermissionConfig,
          );
        },
      };
    }

    return tools;
  };
};

// Helper for bulk soft delete
async function softDeleteManyRecords(
  twentyORMGlobalManager: TwentyORMGlobalManager,
  objectName: string,
  parameters: Record<string, unknown>,
  workspaceId: string,
  rolePermissionConfig: RolePermissionConfig,
) {
  try {
    const repository = await twentyORMGlobalManager.getRepositoryForWorkspace(
      workspaceId,
      objectName,
      rolePermissionConfig,
    );

    const { filter } = parameters;

    if (!filter || typeof filter !== 'object' || !('id' in filter)) {
      return {
        success: false,
        message: `Failed to soft delete many ${objectName}: Filter with record IDs is required`,
        error: 'Filter with record IDs is required for bulk soft delete',
      };
    }

    const idFilter = filter.id as Record<string, unknown>;
    const recordIds = idFilter.in;

    if (!Array.isArray(recordIds) || recordIds.length === 0) {
      return {
        success: false,
        message: `Failed to soft delete many ${objectName}: At least one record ID is required`,
        error: 'At least one record ID is required for bulk soft delete',
      };
    }

    const existingRecords = await repository.find({
      where: { id: { in: recordIds } },
    });

    if (existingRecords.length === 0) {
      return {
        success: false,
        message: `Failed to soft delete many ${objectName}: No records found with the provided IDs`,
        error: 'No records found to soft delete',
      };
    }

    await repository.softDelete({ id: { in: recordIds } });

    return {
      success: true,
      message: `Successfully soft deleted ${existingRecords.length} ${objectName} records`,
      result: {
        count: existingRecords.length,
        deletedIds: recordIds,
      },
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to soft delete many ${objectName}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
