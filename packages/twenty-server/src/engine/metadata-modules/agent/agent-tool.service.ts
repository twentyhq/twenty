import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ToolSet } from 'ai';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { ObjectMetadataService } from 'src/engine/metadata-modules/object-metadata/object-metadata.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

import {
  generateAgentToolUpdateZodSchema,
  generateAgentToolZodSchema,
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

      const whereConditions: Record<string, unknown> = {};

      Object.entries(searchCriteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          whereConditions[key] = value;
        }
      });

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
}
