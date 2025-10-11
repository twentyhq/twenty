import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import {
  generateBulkDeleteToolSchema,
  generateFindOneToolSchema,
  generateFindToolSchema,
  generateSoftDeleteToolSchema,
  getRecordInputSchema,
} from 'src/engine/metadata-modules/agent/utils/agent-tool-schema.utils';
import { isWorkflowRunObject } from 'src/engine/metadata-modules/agent/utils/is-workflow-run-object.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class ToolService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly objectMetadataService: ObjectMetadataService,
    protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly deleteRecordService: DeleteRecordService,
    private readonly findRecordsService: FindRecordsService,
  ) {}

  async listTools(roleId: string, workspaceId: string): Promise<ToolSet> {
    const tools: ToolSet = {};

    const { data: rolesPermissions } =
      await this.workspacePermissionsCacheService.getRolesPermissionsFromCache({
        workspaceId,
      });

    const objectPermissions = rolesPermissions[roleId];

    const allObjectMetadata =
      await this.objectMetadataService.findManyWithinWorkspace(workspaceId, {
        where: {
          isActive: true,
          isSystem: false,
        },
        relations: ['fields'],
      });

    const filteredObjectMetadata = allObjectMetadata.filter(
      (objectMetadata) => !isWorkflowRunObject(objectMetadata),
    );

    filteredObjectMetadata.forEach((objectMetadata) => {
      const objectPermission = objectPermissions[objectMetadata.id];

      if (!objectPermission) {
        return;
      }

      if (objectPermission.canUpdate) {
        tools[`create_${objectMetadata.nameSingular}`] = {
          description: `Create a new ${objectMetadata.labelSingular} record. Provide all required fields and any optional fields you want to set. The system will automatically handle timestamps and IDs. Returns the created record with all its data.`,
          inputSchema: getRecordInputSchema(objectMetadata),
          execute: async (parameters) => {
            return this.createRecordService.execute({
              objectName: objectMetadata.nameSingular,
              objectRecord: parameters.input,
              workspaceId,
              roleId,
            });
          },
        };

        tools[`update_${objectMetadata.nameSingular}`] = {
          description: `Update an existing ${objectMetadata.labelSingular} record. Provide the record ID and only the fields you want to change. Unspecified fields will remain unchanged. Returns the updated record with all current data.`,
          inputSchema: getRecordInputSchema(objectMetadata),
          execute: async (parameters) => {
            const { id, ...objectRecord } = parameters.input;

            return this.updateRecordService.execute({
              objectName: objectMetadata.nameSingular,
              objectRecordId: id,
              objectRecord,
              workspaceId,
              roleId,
            });
          },
        };
      }

      if (objectPermission.canRead) {
        tools[`find_${objectMetadata.nameSingular}`] = {
          description: `Search for ${objectMetadata.labelSingular} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination. Returns an array of matching records with their full data.`,
          inputSchema: generateFindToolSchema(objectMetadata),
          execute: async (parameters) => {
            const { limit, offset, ...filter } = parameters.input;

            return this.findRecordsService.execute({
              objectName: objectMetadata.nameSingular,
              filter,
              limit,
              offset,
              workspaceId,
              roleId,
            });
          },
        };

        tools[`find_one_${objectMetadata.nameSingular}`] = {
          description: `Retrieve a single ${objectMetadata.labelSingular} record by its unique ID. Use this when you know the exact record ID and need the complete record data. Returns the full record or an error if not found.`,
          inputSchema: generateFindOneToolSchema(),
          execute: async (parameters) => {
            return this.findRecordsService.execute({
              objectName: objectMetadata.nameSingular,
              filter: { id: { eq: parameters.input.id } },
              limit: 1,
              workspaceId,
              roleId,
            });
          },
        };
      }

      if (objectPermission.canSoftDelete) {
        tools[`soft_delete_${objectMetadata.nameSingular}`] = {
          description: `Soft delete a ${objectMetadata.labelSingular} record by marking it as deleted. The record remains in the database but is hidden from normal queries. This is reversible and preserves all data. Use this for temporary removal.`,
          inputSchema: generateSoftDeleteToolSchema(),
          execute: async (parameters) => {
            return this.deleteRecordService.execute({
              objectName: objectMetadata.nameSingular,
              objectRecordId: parameters.input.id,
              workspaceId,
              roleId,
              soft: true,
            });
          },
        };

        tools[`soft_delete_many_${objectMetadata.nameSingular}`] = {
          description: `Soft delete multiple ${objectMetadata.labelSingular} records at once by providing an array of record IDs. All records are marked as deleted but remain in the database. This is efficient for bulk operations and preserves all data.`,
          inputSchema: generateBulkDeleteToolSchema(),
          execute: async (parameters) => {
            return this.softDeleteManyRecords(
              objectMetadata.nameSingular,
              parameters.input,
              workspaceId,
              roleId,
            );
          },
        };
      }
    });

    return tools;
  }

  private async softDeleteManyRecords(
    objectName: string,
    parameters: Record<string, unknown>,
    workspaceId: string,
    roleId: string,
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          { roleId },
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
}
