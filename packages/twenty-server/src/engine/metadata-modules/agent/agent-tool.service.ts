import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ToolSet } from 'ai';
import { FieldMetadataType } from 'twenty-shared/types';
import { Repository } from 'typeorm';
import { z } from 'zod';

import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

import {
  generateAgentToolUpdateZodSchema,
  generateAgentToolZodSchema,
} from './utils/agent-tool-schema.utils';

@Injectable()
export class AgentToolService {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
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

      roleWithPermissions.objectPermissions.forEach((permission) => {
        if (permission.canUpdateObjectRecords) {
          tools[`create_${permission.objectMetadata.nameSingular}`] = {
            description: `Create a new ${permission.objectMetadata.nameSingular}`,
            parameters: generateAgentToolZodSchema(permission.objectMetadata),
            execute: async (parameters) => {
              return this.createRecord(
                permission.objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (permission.canReadObjectRecords) {
          tools[`find_${permission.objectMetadata.nameSingular}`] = {
            description: `Find ${permission.objectMetadata.nameSingular} records by various criteria`,
            parameters: this.generateFindToolSchema(permission.objectMetadata),
            execute: async (parameters) => {
              return this.findRecords(
                permission.objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };

          tools[`find_one_${permission.objectMetadata.nameSingular}`] = {
            description: `Find a single ${permission.objectMetadata.nameSingular} record by ID`,
            parameters: this.generateFindOneToolSchema(),
            execute: async (parameters) => {
              return this.findOneRecord(
                permission.objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (
          permission.canUpdateObjectRecords &&
          !permission.canReadObjectRecords
        ) {
          tools[`find_for_update_${permission.objectMetadata.nameSingular}`] = {
            description: `Find ${permission.objectMetadata.nameSingular} records for update (returns minimal data: id and name only)`,
            parameters: this.generateFindToolSchema(permission.objectMetadata),
            execute: async (parameters) => {
              return this.findRecordsForUpdate(
                permission.objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (permission.canUpdateObjectRecords) {
          tools[`update_${permission.objectMetadata.nameSingular}`] = {
            description: `Update an existing ${permission.objectMetadata.nameSingular}`,
            parameters: generateAgentToolUpdateZodSchema(
              permission.objectMetadata,
            ),
            execute: async (parameters) => {
              return this.updateRecord(
                permission.objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (permission.canSoftDeleteObjectRecords) {
          tools[`soft_delete_${permission.objectMetadata.nameSingular}`] = {
            description: `Soft delete a ${permission.objectMetadata.nameSingular} record (marks as deleted but keeps data)`,
            parameters: this.generateDeleteToolSchema(),
            execute: async (parameters) => {
              return this.softDeleteRecord(
                permission.objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }

        if (permission.canDestroyObjectRecords) {
          tools[`destroy_${permission.objectMetadata.nameSingular}`] = {
            description: `Permanently destroy a ${permission.objectMetadata.nameSingular} record (irreversible deletion)`,
            parameters: this.generateDeleteToolSchema(),
            execute: async (parameters) => {
              return this.destroyRecord(
                permission.objectMetadata.nameSingular,
                parameters,
                workspaceId,
              );
            },
          };
        }
      });

      return tools;
    } catch (error) {
      console.error(`Error generating tools for agent ${agentId}:`, error);

      return {};
    }
  }

  private generateFindToolSchema(objectMetadata: ObjectMetadataEntity) {
    const schemaFields: Record<string, z.ZodTypeAny> = {
      limit: z
        .number()
        .optional()
        .describe('Maximum number of records to return (default: 10)')
        .default(10),
      offset: z
        .number()
        .optional()
        .describe('Number of records to skip (default: 0)')
        .default(0),
    };

    objectMetadata.fields.forEach((field: FieldMetadataEntity) => {
      if (
        field.name === 'id' ||
        field.name === 'createdAt' ||
        field.name === 'updatedAt' ||
        field.name === 'deletedAt' ||
        field.name === 'searchVector' ||
        field.type === FieldMetadataType.TS_VECTOR
      ) {
        return;
      }

      if (
        field.type === FieldMetadataType.TEXT ||
        field.type === FieldMetadataType.RICH_TEXT ||
        field.type === FieldMetadataType.FULL_NAME
      ) {
        schemaFields[field.name] = z
          .string()
          .optional()
          .describe(`Search by ${field.name}`);
      }
    });

    return z.object(schemaFields);
  }

  private generateFindOneToolSchema() {
    return z.object({
      id: z.string().describe('The ID of the record to find'),
    });
  }

  private async findRecords(
    objectName: string,
    parameters: Record<string, unknown>,
    workspaceId: string,
  ) {
    console.log({ objectName, parameters, workspaceId });
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
      console.error(`Error finding ${objectName} records:`, error);

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
    console.log({ objectName, parameters, workspaceId });
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
      console.error(`Error finding ${objectName} record:`, error);

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
      console.error(`Error creating ${objectName}:`, error);

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
    console.log({ update: { objectName, parameters, workspaceId } });
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
      console.error(`Error updating ${objectName}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to update ${objectName}`,
      };
    }
  }

  private async findRecordsForUpdate(
    objectName: string,
    parameters: Record<string, unknown>,
    workspaceId: string,
  ) {
    console.log({ objectName, parameters, workspaceId });
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

      const minimalRecords = records.map((record: Record<string, unknown>) => ({
        id: record.id,
        name: record.name,
      }));

      return {
        success: true,
        records: minimalRecords,
        count: minimalRecords.length,
        message: `Found ${minimalRecords.length} ${objectName} records (minimal data for update operations)`,
      };
    } catch (error) {
      console.error(`Error finding ${objectName} records for update:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to find ${objectName} records for update`,
      };
    }
  }

  private generateDeleteToolSchema() {
    return z.object({
      id: z.string().describe('The ID of the record to delete'),
    });
  }

  private async softDeleteRecord(
    objectName: string,
    parameters: Record<string, unknown>,
    workspaceId: string,
  ) {
    console.log({ softDelete: { objectName, parameters, workspaceId } });
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
      console.error(`Error soft deleting ${objectName}:`, error);

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
    console.log({ destroy: { objectName, parameters, workspaceId } });
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
      console.error(`Error destroying ${objectName}:`, error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: `Failed to destroy ${objectName}`,
      };
    }
  }
}
