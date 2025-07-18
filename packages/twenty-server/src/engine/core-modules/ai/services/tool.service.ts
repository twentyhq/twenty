import { Injectable } from '@nestjs/common';

import { ToolSet } from 'ai';
import {
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
} from 'typeorm';

import {
  generateBulkDeleteToolSchema,
  generateFindOneToolSchema,
  generateFindToolSchema,
  generateSoftDeleteToolSchema,
  getRecordInputSchema,
} from 'src/engine/metadata-modules/agent/utils/agent-tool-schema.utils';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/agent/utils/is-workflow-related-object.util';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Injectable()
export class ToolService {
  constructor(
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly objectMetadataService: ObjectMetadataService,
    protected readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
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
      (objectMetadata) => !isWorkflowRelatedObject(objectMetadata),
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

      const whereConditions = this.buildWhereConditions(searchCriteria);

      const records = await repository.find({
        where: whereConditions,
        take: limit as number,
        skip: offset as number,
        order: { createdAt: 'DESC' },
      });

      return {
        success: true,
        records,
        count: records.length,
        message: `Found ${records.length} ${objectName} records`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to find ${objectName} records`,
      };
    }
  }

  private buildWhereConditions(
    searchCriteria: Record<string, unknown>,
  ): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    Object.entries(searchCriteria).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        return;
      }

      if (typeof value === 'object' && !Array.isArray(value)) {
        const nestedConditions = this.buildNestedWhereConditions(
          value as Record<string, unknown>,
        );

        if (Object.keys(nestedConditions).length > 0) {
          whereConditions[key] = nestedConditions;
        } else {
          const filterCondition = this.parseFilterCondition(
            value as Record<string, unknown>,
          );

          if (filterCondition !== null) {
            whereConditions[key] = filterCondition;
          }
        }

        return;
      }

      whereConditions[key] = value;
    });

    return whereConditions;
  }

  private buildNestedWhereConditions(
    nestedValue: Record<string, unknown>,
  ): Record<string, unknown> {
    const nestedConditions: Record<string, unknown> = {};

    Object.entries(nestedValue).forEach(([nestedKey, nestedFieldValue]) => {
      if (
        nestedFieldValue === undefined ||
        nestedFieldValue === null ||
        nestedFieldValue === ''
      ) {
        return;
      }

      if (
        typeof nestedFieldValue === 'object' &&
        !Array.isArray(nestedFieldValue)
      ) {
        const filterCondition = this.parseFilterCondition(
          nestedFieldValue as Record<string, unknown>,
        );

        if (filterCondition !== null) {
          nestedConditions[nestedKey] = filterCondition;
        }
      } else {
        nestedConditions[nestedKey] = nestedFieldValue;
      }
    });

    return nestedConditions;
  }

  private parseFilterCondition(filterValue: Record<string, unknown>): unknown {
    if ('eq' in filterValue) {
      return filterValue.eq;
    }
    if ('neq' in filterValue) {
      return Not(filterValue.neq);
    }
    if ('gt' in filterValue) {
      return MoreThan(filterValue.gt);
    }
    if ('gte' in filterValue) {
      return MoreThanOrEqual(filterValue.gte);
    }
    if ('lt' in filterValue) {
      return LessThan(filterValue.lt);
    }
    if ('lte' in filterValue) {
      return LessThanOrEqual(filterValue.lte);
    }
    if ('in' in filterValue) {
      return In(filterValue.in as string[]);
    }
    if ('like' in filterValue) {
      return Like(filterValue.like as string);
    }
    if ('ilike' in filterValue) {
      return ILike(filterValue.ilike as string);
    }
    if ('startsWith' in filterValue) {
      return Like(`${filterValue.startsWith}%`);
    }
    if ('is' in filterValue) {
      if (filterValue.is === 'NULL') {
        return IsNull();
      }
      if (filterValue.is === 'NOT_NULL') {
        return Not(IsNull());
      }
    }
    if ('isEmptyArray' in filterValue) {
      return [];
    }
    if ('containsIlike' in filterValue) {
      return Like(`%${filterValue.containsIlike}%`);
    }

    return null;
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
          error: 'Record ID is required',
          message: `Failed to find ${objectName}: Record ID is required`,
        };
      }

      const record = await repository.findOne({
        where: { id },
      });

      if (!record) {
        return {
          success: false,
          error: 'Record not found',
          message: `Failed to find ${objectName}: Record with ID ${id} not found`,
        };
      }

      return {
        success: true,
        record,
        message: `Found ${objectName} record`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to find ${objectName} record`,
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

      const createdRecord = await repository.save(parameters);

      return {
        success: true,
        record: createdRecord,
        message: `Successfully created ${objectName}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to create ${objectName}`,
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
          error: 'Record ID is required for update',
          message: `Failed to update ${objectName}: Record ID is required`,
        };
      }

      const existingRecord = await repository.findOne({
        where: { id },
      });

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
          message: `Failed to update ${objectName}: Record with ID ${id} not found`,
        };
      }

      await repository.update(id as string, updateData);

      const updatedRecord = await repository.findOne({
        where: { id: id as string },
      });

      if (!updatedRecord) {
        return {
          success: false,
          error: 'Failed to retrieve updated record',
          message: `Failed to update ${objectName}: Could not retrieve updated record`,
        };
      }

      return {
        success: true,
        record: updatedRecord,
        message: `Successfully updated ${objectName}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to update ${objectName}`,
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
          error: 'Record ID is required for soft delete',
          message: `Failed to soft delete ${objectName}: Record ID is required`,
        };
      }

      const existingRecord = await repository.findOne({
        where: { id },
      });

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
          message: `Failed to soft delete ${objectName}: Record with ID ${id} not found`,
        };
      }

      await repository.softDelete(id);

      return {
        success: true,
        message: `Successfully soft deleted ${objectName}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to soft delete ${objectName}`,
      };
    }
  }

  private async destroyRecord(
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
          error: 'Record ID is required for destroy',
          message: `Failed to destroy ${objectName}: Record ID is required`,
        };
      }

      const existingRecord = await repository.findOne({
        where: { id },
      });

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
          message: `Failed to destroy ${objectName}: Record with ID ${id} not found`,
        };
      }

      await repository.remove(existingRecord);

      return {
        success: true,
        message: `Successfully destroyed ${objectName}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to destroy ${objectName}`,
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
          error: 'Filter with record IDs is required for bulk soft delete',
          message: `Failed to soft delete many ${objectName}: Filter with record IDs is required`,
        };
      }

      const idFilter = filter.id as Record<string, unknown>;
      const recordIds = idFilter.in;

      if (!Array.isArray(recordIds) || recordIds.length === 0) {
        return {
          success: false,
          error: 'At least one record ID is required for bulk soft delete',
          message: `Failed to soft delete many ${objectName}: At least one record ID is required`,
        };
      }

      const existingRecords = await repository.find({
        where: { id: { in: recordIds } },
      });

      if (existingRecords.length === 0) {
        return {
          success: false,
          error: 'No records found to soft delete',
          message: `Failed to soft delete many ${objectName}: No records found with the provided IDs`,
        };
      }

      await repository.softDelete({ id: { in: recordIds } });

      return {
        success: true,
        count: existingRecords.length,
        message: `Successfully soft deleted ${existingRecords.length} ${objectName} records`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to soft delete many ${objectName}`,
      };
    }
  }

  private async destroyManyRecords(
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
          error: 'Filter with record IDs is required for bulk destroy',
          message: `Failed to destroy many ${objectName}: Filter with record IDs is required`,
        };
      }

      const idFilter = filter.id as Record<string, unknown>;
      const recordIds = idFilter.in as string[];

      if (!Array.isArray(recordIds) || recordIds.length === 0) {
        return {
          success: false,
          error: 'At least one record ID is required for bulk destroy',
          message: `Failed to destroy many ${objectName}: At least one record ID is required`,
        };
      }

      const existingRecords = await repository.find({
        where: { id: { in: recordIds } },
      });

      if (existingRecords.length === 0) {
        return {
          success: false,
          error: 'No records found to destroy',
          message: `Failed to destroy many ${objectName}: No records found with the provided IDs`,
        };
      }

      await repository.delete({ id: { in: recordIds } });

      return {
        success: true,
        count: existingRecords.length,
        message: `Successfully destroyed ${existingRecords.length} ${objectName} records`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to destroy many ${objectName}`,
      };
    }
  }
}
