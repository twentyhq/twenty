import { Injectable } from '@nestjs/common';

import { type ToolSet } from 'ai';

import { buildWhereConditions } from 'src/engine/core-modules/ai/utils/find-records-filters.utils';
import { RecordInputTransformerService } from 'src/engine/core-modules/record-transformer/services/record-input-transformer.service';
import {
  generateBulkDeleteToolSchema,
  generateFindOneToolSchema,
  generateFindToolSchema,
  generateSoftDeleteToolSchema,
  getRecordInputSchema,
} from 'src/engine/metadata-modules/agent/utils/agent-tool-schema.utils';
import { isWorkflowRunObject } from 'src/engine/metadata-modules/agent/utils/is-workflow-run-object.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { getObjectMetadataMapItemByNameSingular } from 'src/engine/metadata-modules/utils/get-object-metadata-map-item-by-name-singular.util';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';

@Injectable()
export class ToolService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly objectMetadataService: ObjectMetadataService,
    protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly recordInputTransformerService: RecordInputTransformerService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
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
          parameters: getRecordInputSchema(objectMetadata),
          execute: async (parameters) => {
            return this.createRecord(
              objectMetadata.nameSingular,
              parameters.input,
              workspaceId,
              roleId,
            );
          },
        };

        tools[`update_${objectMetadata.nameSingular}`] = {
          description: `Update an existing ${objectMetadata.labelSingular} record. Provide the record ID and only the fields you want to change. Unspecified fields will remain unchanged. Returns the updated record with all current data.`,
          parameters: getRecordInputSchema(objectMetadata),
          execute: async (parameters) => {
            return this.updateRecord(
              objectMetadata.nameSingular,
              parameters.input,
              workspaceId,
              roleId,
            );
          },
        };
      }

      if (objectPermission.canRead) {
        tools[`find_${objectMetadata.nameSingular}`] = {
          description: `Search for ${objectMetadata.labelSingular} records using flexible filtering criteria. Supports exact matches, pattern matching, ranges, and null checks. Use limit/offset for pagination. Returns an array of matching records with their full data.`,
          parameters: generateFindToolSchema(objectMetadata),
          execute: async (parameters) => {
            return this.findRecords(
              objectMetadata.nameSingular,
              parameters.input,
              workspaceId,
              roleId,
            );
          },
        };

        tools[`find_one_${objectMetadata.nameSingular}`] = {
          description: `Retrieve a single ${objectMetadata.labelSingular} record by its unique ID. Use this when you know the exact record ID and need the complete record data. Returns the full record or an error if not found.`,
          parameters: generateFindOneToolSchema(),
          execute: async (parameters) => {
            return this.findOneRecord(
              objectMetadata.nameSingular,
              parameters.input,
              workspaceId,
              roleId,
            );
          },
        };
      }

      if (objectPermission.canSoftDelete) {
        tools[`soft_delete_${objectMetadata.nameSingular}`] = {
          description: `Soft delete a ${objectMetadata.labelSingular} record by marking it as deleted. The record remains in the database but is hidden from normal queries. This is reversible and preserves all data. Use this for temporary removal.`,
          parameters: generateSoftDeleteToolSchema(),
          execute: async (parameters) => {
            return this.softDeleteRecord(
              objectMetadata.nameSingular,
              parameters.input,
              workspaceId,
              roleId,
            );
          },
        };

        tools[`soft_delete_many_${objectMetadata.nameSingular}`] = {
          description: `Soft delete multiple ${objectMetadata.labelSingular} records at once by providing an array of record IDs. All records are marked as deleted but remain in the database. This is efficient for bulk operations and preserves all data.`,
          parameters: generateBulkDeleteToolSchema(),
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

  private async findRecords(
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

      const { limit = 100, offset = 0, ...searchCriteria } = parameters;

      const whereConditions = buildWhereConditions(searchCriteria);

      const records = await repository.find({
        where: whereConditions,
        take: limit as number,
        skip: offset as number,
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        message: `Found ${records.length} ${objectName} records`,
        result: {
          records,
          count: records.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to find ${objectName} records`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async findOneRecord(
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

      const { id } = parameters;

      if (!id || typeof id !== 'string') {
        return {
          success: false,
          message: `Failed to find ${objectName}: Record ID is required`,
          error: 'Record ID is required',
        };
      }

      const record = await repository.findOne({
        where: { id },
      });

      if (!record) {
        return {
          success: false,
          message: `Failed to find ${objectName}: Record with ID ${id} not found`,
          error: 'Record not found',
        };
      }

      return {
        success: true,
        message: `Found ${objectName} record`,
        result: record,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to find ${objectName} record`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async createRecord(
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

      const objectMetadataMaps =
        await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
          workspaceId,
        );

      const objectMetadataItemWithFieldsMaps =
        getObjectMetadataMapItemByNameSingular(objectMetadataMaps, objectName);

      if (!objectMetadataItemWithFieldsMaps) {
        return {
          success: false,
          message: `Failed to create ${objectName}: Object metadata not found`,
          error: 'Object metadata not found',
        };
      }

      const transformedCreateData =
        await this.recordInputTransformerService.process({
          recordInput: parameters,
          objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
        });

      const createdRecord = await repository.save(transformedCreateData);

      return {
        success: true,
        message: `Successfully created ${objectName}`,
        result: createdRecord,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to create ${objectName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async updateRecord(
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

      const { id, ...updateData } = parameters;

      if (!id || typeof id !== 'string') {
        return {
          success: false,
          message: `Failed to update ${objectName}: Record ID is required`,
          error: 'Record ID is required for update',
        };
      }

      const existingRecord = await repository.findOne({
        where: { id },
      });

      if (!existingRecord) {
        return {
          success: false,
          message: `Failed to update ${objectName}: Record with ID ${id} not found`,
          error: 'Record not found',
        };
      }

      const objectMetadataMaps =
        await this.workspaceCacheStorageService.getObjectMetadataMapsOrThrow(
          workspaceId,
        );

      const objectMetadataItemWithFieldsMaps =
        getObjectMetadataMapItemByNameSingular(objectMetadataMaps, objectName);

      if (!objectMetadataItemWithFieldsMaps) {
        return {
          success: false,
          message: `Failed to update ${objectName}: Object metadata not found`,
          error: 'Object metadata not found',
        };
      }

      const transformedUpdateData =
        await this.recordInputTransformerService.process({
          recordInput: updateData,
          objectMetadataMapItem: objectMetadataItemWithFieldsMaps,
        });

      await repository.update(id as string, transformedUpdateData);

      const updatedRecord = await repository.findOne({
        where: { id: id as string },
      });

      if (!updatedRecord) {
        return {
          success: false,
          message: `Failed to update ${objectName}: Could not retrieve updated record`,
          error: 'Failed to retrieve updated record',
        };
      }

      return {
        success: true,
        message: `Successfully updated ${objectName}`,
        result: updatedRecord,
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to update ${objectName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async softDeleteRecord(
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

      const { id } = parameters;

      if (!id || typeof id !== 'string') {
        return {
          success: false,
          message: `Failed to soft delete ${objectName}: Record ID is required`,
          error: 'Record ID is required for soft delete',
        };
      }

      const existingRecord = await repository.findOne({
        where: { id },
      });

      if (!existingRecord) {
        return {
          success: false,
          message: `Failed to soft delete ${objectName}: Record with ID ${id} not found`,
          error: 'Record not found',
        };
      }

      await repository.softDelete(id);

      return {
        success: true,
        message: `Successfully soft deleted ${objectName}`,
        result: { id },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to soft delete ${objectName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  private async _destroyRecord(
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

      const { id } = parameters;

      if (!id || typeof id !== 'string') {
        return {
          success: false,
          message: `Failed to destroy ${objectName}: Record ID is required`,
          error: 'Record ID is required for destroy',
        };
      }

      const existingRecord = await repository.findOne({
        where: { id },
      });

      if (!existingRecord) {
        return {
          success: false,
          message: `Failed to destroy ${objectName}: Record with ID ${id} not found`,
          error: 'Record not found',
        };
      }

      await repository.remove(existingRecord);

      return {
        success: true,
        message: `Successfully destroyed ${objectName}`,
        result: { id },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to destroy ${objectName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
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

  private async _destroyManyRecords(
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
          message: `Failed to destroy many ${objectName}: Filter with record IDs is required`,
          error: 'Filter with record IDs is required for bulk destroy',
        };
      }

      const idFilter = filter.id as Record<string, unknown>;
      const recordIds = idFilter.in as string[];

      if (!Array.isArray(recordIds) || recordIds.length === 0) {
        return {
          success: false,
          message: `Failed to destroy many ${objectName}: At least one record ID is required`,
          error: 'At least one record ID is required for bulk destroy',
        };
      }

      const existingRecords = await repository.find({
        where: { id: { in: recordIds } },
      });

      if (existingRecords.length === 0) {
        return {
          success: false,
          message: `Failed to destroy many ${objectName}: No records found with the provided IDs`,
          error: 'No records found to destroy',
        };
      }

      await repository.delete({ id: { in: recordIds } });

      return {
        success: true,
        message: `Successfully destroyed ${existingRecords.length} ${objectName} records`,
        result: {
          count: existingRecords.length,
          destroyedIds: recordIds,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to destroy many ${objectName}`,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
