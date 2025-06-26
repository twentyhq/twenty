import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ToolSet } from 'ai';
import {
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  Like,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { z } from 'zod';

import { DatabaseEventAction } from 'src/engine/api/graphql/graphql-query-runner/enums/database-event-action';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';

import {
  generateAgentToolUpdateZodSchema,
  generateAgentToolZodSchema,
  generateBulkDeleteToolSchema,
  generateFindToolSchema,
} from './utils/agent-tool-schema.utils';
import { isWorkflowRelatedObject } from './utils/is-workflow-related-object.util';

@Injectable()
export class AgentToolService {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly objectMetadataService: ObjectMetadataService,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    try {
      const agent = await this.agentService.findOneAgent(agentId, workspaceId);

      if (!agent.roleId) {
        return {};
      }

      const roleWithPermissions = await this.roleRepository.findOne({
        where: {
          id: agent.roleId,
          workspaceId,
        },
        relations: [
          'objectPermissions',
          'objectPermissions.objectMetadata',
          'objectPermissions.objectMetadata.fields',
        ],
      });

      if (!roleWithPermissions) {
        return {};
      }

      const tools: ToolSet = {};

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

      const objectPermissionsMap = new Map(
        roleWithPermissions.objectPermissions.map((permission) => [
          permission.objectMetadataId,
          permission,
        ]),
      );

      filteredObjectMetadata.forEach((objectMetadata) => {
        const objectPermission = objectPermissionsMap.get(objectMetadata.id);

        const canCreate =
          roleWithPermissions.canUpdateAllObjectRecords ||
          (objectPermission?.canUpdateObjectRecords ?? false);
        const canRead =
          roleWithPermissions.canReadAllObjectRecords ||
          (objectPermission?.canReadObjectRecords ?? false);
        const canUpdate =
          roleWithPermissions.canUpdateAllObjectRecords ||
          (objectPermission?.canUpdateObjectRecords ?? false);
        const canSoftDelete =
          roleWithPermissions.canSoftDeleteAllObjectRecords ||
          (objectPermission?.canSoftDeleteObjectRecords ?? false);
        const canDestroy =
          roleWithPermissions.canDestroyAllObjectRecords ||
          (objectPermission?.canDestroyObjectRecords ?? false);

        if (canCreate) {
          tools[`create_${objectMetadata.nameSingular}`] = {
            description: `Create a new ${objectMetadata.nameSingular}`,
            parameters: generateAgentToolZodSchema(objectMetadata),
            execute: async (parameters) => {
              return this.createRecord(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (canRead) {
          tools[`find_${objectMetadata.nameSingular}`] = {
            description: `Find ${objectMetadata.nameSingular} records by various criteria`,
            parameters: generateFindToolSchema(objectMetadata),
            execute: async (parameters) => {
              return this.findRecords(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };

          tools[`find_one_${objectMetadata.nameSingular}`] = {
            description: `Find a single ${objectMetadata.nameSingular} record by ID`,
            parameters: z.object({
              id: z.string().describe('The ID of the record to find'),
            }),
            execute: async (parameters) => {
              return this.findOneRecord(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (canUpdate) {
          tools[`update_${objectMetadata.nameSingular}`] = {
            description: `Update an existing ${objectMetadata.nameSingular}`,
            parameters: generateAgentToolUpdateZodSchema(objectMetadata),
            execute: async (parameters) => {
              return this.updateRecord(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (canSoftDelete) {
          tools[`soft_delete_${objectMetadata.nameSingular}`] = {
            description: `Soft delete a ${objectMetadata.nameSingular} record (marks as deleted but keeps data)`,
            parameters: z.object({
              id: z.string().describe('The ID of the record to delete'),
            }),
            execute: async (parameters) => {
              return this.softDeleteRecord(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };

          tools[`soft_delete_many_${objectMetadata.nameSingular}`] = {
            description: `Soft delete multiple ${objectMetadata.nameSingular} records by IDs (marks as deleted but keeps data)`,
            parameters: generateBulkDeleteToolSchema(),
            execute: async (parameters) => {
              return this.softDeleteManyRecords(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (canDestroy) {
          tools[`destroy_${objectMetadata.nameSingular}`] = {
            description: `Permanently destroy a ${objectMetadata.nameSingular} record (irreversible deletion)`,
            parameters: z.object({
              id: z.string().describe('The ID of the record to delete'),
            }),
            execute: async (parameters) => {
              return this.destroyRecord(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };

          tools[`destroy_many_${objectMetadata.nameSingular}`] = {
            description: `Permanently destroy multiple ${objectMetadata.nameSingular} records by IDs (irreversible deletion)`,
            parameters: generateBulkDeleteToolSchema(),
            execute: async (parameters) => {
              return this.destroyManyRecords(
                objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }
      });

      return tools;
    } catch (error) {
      return {};
    }
  }

  private async findRecords(
    objectName: string,
    parameters: Record<string, unknown>,
    workspaceId: string,
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
        );

      const { limit = 10, offset = 0, ...searchCriteria } = parameters;

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
      if (value !== undefined && value !== null && value !== '') {
        if (typeof value === 'object' && !Array.isArray(value)) {
          const filterCondition = this.parseFilterCondition(
            value as Record<string, unknown>,
          );

          if (filterCondition !== null) {
            whereConditions[key] = filterCondition;
          }
        } else {
          whereConditions[key] = value;
        }
      }
    });

    return whereConditions;
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
      return Like(filterValue.ilike as string);
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
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
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
        where: { id: id as string },
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

  private async createRecord(
    objectName: string,
    parameters: Record<string, unknown>,
    workspaceId: string,
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
        );

      const createdRecord = await repository.save(parameters);

      await this.emitDatabaseEvent({
        objectName,
        action: DatabaseEventAction.CREATED,
        records: [createdRecord],
        workspaceId,
      });

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
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
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
        where: { id: id as string },
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

      await this.emitDatabaseEvent({
        objectName,
        action: DatabaseEventAction.UPDATED,
        records: [updatedRecord],
        workspaceId,
        beforeRecords: [existingRecord],
      });

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
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
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
        where: { id: id as string },
      });

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
          message: `Failed to soft delete ${objectName}: Record with ID ${id} not found`,
        };
      }

      await repository.softDelete(id as string);

      await this.emitDatabaseEvent({
        objectName,
        action: DatabaseEventAction.DELETED,
        records: [existingRecord],
        workspaceId,
      });

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
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
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
        where: { id: id as string },
      });

      if (!existingRecord) {
        return {
          success: false,
          error: 'Record not found',
          message: `Failed to destroy ${objectName}: Record with ID ${id} not found`,
        };
      }

      await repository.remove(existingRecord);

      await this.emitDatabaseEvent({
        objectName,
        action: DatabaseEventAction.DESTROYED,
        records: [existingRecord],
        workspaceId,
      });

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
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
        );

      const { filter } = parameters;

      if (!filter || typeof filter !== 'object' || !('id' in filter)) {
        return {
          success: false,
          error: 'Filter with record IDs is required for bulk soft delete',
          message: `Failed to soft delete many ${objectName}: Filter with record IDs is required`,
        };
      }

      const filterObj = filter as Record<string, unknown>;
      const idFilter = filterObj.id as Record<string, unknown>;
      const recordIds = idFilter.in as string[];

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

      await this.emitDatabaseEvent({
        objectName,
        action: DatabaseEventAction.DELETED,
        records: existingRecords,
        workspaceId,
      });

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
  ) {
    try {
      const repository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          objectName,
          {
            shouldBypassPermissionChecks: true,
          },
        );

      const { filter } = parameters;

      if (!filter || typeof filter !== 'object' || !('id' in filter)) {
        return {
          success: false,
          error: 'Filter with record IDs is required for bulk destroy',
          message: `Failed to destroy many ${objectName}: Filter with record IDs is required`,
        };
      }

      const filterObj = filter as Record<string, unknown>;
      const idFilter = filterObj.id as Record<string, unknown>;
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

      await this.emitDatabaseEvent({
        objectName,
        action: DatabaseEventAction.DESTROYED,
        records: existingRecords,
        workspaceId,
      });

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

  private async emitDatabaseEvent({
    objectName,
    action,
    records,
    workspaceId,
    beforeRecords,
  }: {
    objectName: string;
    action: DatabaseEventAction;
    records: Record<string, unknown>[];
    workspaceId: string;
    beforeRecords?: Record<string, unknown>[];
  }) {
    const objectMetadata =
      await this.objectMetadataService.findOneWithinWorkspace(workspaceId, {
        where: {
          nameSingular: objectName,
          isActive: true,
        },
        relations: ['fields'],
      });

    if (!objectMetadata) {
      return;
    }

    this.workspaceEventEmitter.emitDatabaseBatchEvent({
      objectMetadataNameSingular: objectName,
      action,
      events: records.map((record) => {
        const beforeRecord = beforeRecords?.find((r) => r.id === record.id);

        return {
          recordId: record.id as string,
          objectMetadata,
          properties: {
            before: beforeRecord || undefined,
            after:
              action === DatabaseEventAction.DELETED ||
              action === DatabaseEventAction.DESTROYED
                ? undefined
                : (record as Record<string, unknown>),
          },
        };
      }),
      workspaceId,
    });
  }
}
