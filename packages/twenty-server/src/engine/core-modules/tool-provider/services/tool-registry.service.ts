import { Inject, Injectable, Logger, Optional } from '@nestjs/common';

import { type ToolSet } from 'ai';
import { PermissionFlagType } from 'twenty-shared/constants';
import { type ActorMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { CreateRecordService } from 'src/engine/core-modules/record-crud/services/create-record.service';
import { DeleteRecordService } from 'src/engine/core-modules/record-crud/services/delete-record.service';
import { FindRecordsService } from 'src/engine/core-modules/record-crud/services/find-records.service';
import { UpdateRecordService } from 'src/engine/core-modules/record-crud/services/update-record.service';
import { createDirectRecordToolsFactory } from 'src/engine/core-modules/record-crud/tool-factory/direct-record-tools.factory';
import { WORKFLOW_TOOL_SERVICE_TOKEN } from 'src/engine/core-modules/tool-provider/constants/workflow-tool-service.token';
import { HttpTool } from 'src/engine/core-modules/tool/tools/http-tool/http-tool';
import { SearchArticlesTool } from 'src/engine/core-modules/tool/tools/search-articles-tool/search-articles-tool';
import { SendEmailTool } from 'src/engine/core-modules/tool/tools/send-email-tool/send-email-tool';
import { isWorkflowRelatedObject } from 'src/engine/metadata-modules/ai/ai-agent/utils/is-workflow-related-object.util';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { PermissionsService } from 'src/engine/metadata-modules/permissions/permissions.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { computePermissionIntersection } from 'src/engine/twenty-orm/utils/compute-permission-intersection.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import type { WorkflowToolWorkspaceService } from 'src/modules/workflow/workflow-tools/services/workflow-tool.workspace-service';

export type ToolIndexEntry = {
  name: string;
  description: string;
  category: 'database' | 'action' | 'workflow' | 'metadata';
  objectName?: string;
  operation?: string;
};

export type ToolSearchOptions = {
  limit?: number;
  category?: 'database' | 'action' | 'workflow' | 'metadata';
};

export type ToolContext = {
  workspaceId: string;
  roleId: string;
  actorContext?: ActorMetadata;
};

// Workflow tool definitions for the index (static metadata)
const WORKFLOW_TOOLS_METADATA: Array<{ name: string; description: string }> = [
  {
    name: 'create_complete_workflow',
    description:
      'Create a complete workflow with trigger, steps, and connections in a single operation',
  },
  {
    name: 'create_workflow_version_step',
    description: 'Create a new step in a workflow version',
  },
  {
    name: 'update_workflow_version_step',
    description: 'Update an existing step in a workflow version',
  },
  {
    name: 'delete_workflow_version_step',
    description: 'Delete a step from a workflow version',
  },
  {
    name: 'create_workflow_version_edge',
    description: 'Create a connection (edge) between two workflow steps',
  },
  {
    name: 'delete_workflow_version_edge',
    description: 'Delete a connection (edge) between workflow steps',
  },
  {
    name: 'create_draft_from_workflow_version',
    description: 'Create a new draft workflow version from an existing one',
  },
  {
    name: 'update_workflow_version_positions',
    description: 'Update the positions of multiple workflow steps',
  },
  {
    name: 'activate_workflow_version',
    description:
      'Activate a workflow version to make it available for execution',
  },
  {
    name: 'deactivate_workflow_version',
    description: 'Deactivate a workflow version',
  },
  {
    name: 'compute_step_output_schema',
    description: 'Compute the output schema for a workflow step',
  },
];

@Injectable()
export class ToolRegistryService {
  private readonly logger = new Logger(ToolRegistryService.name);

  constructor(
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly permissionsService: PermissionsService,
    private readonly httpTool: HttpTool,
    private readonly sendEmailTool: SendEmailTool,
    private readonly searchArticlesTool: SearchArticlesTool,
    private readonly createRecordService: CreateRecordService,
    private readonly updateRecordService: UpdateRecordService,
    private readonly deleteRecordService: DeleteRecordService,
    private readonly findRecordsService: FindRecordsService,
    @Optional()
    @Inject(WORKFLOW_TOOL_SERVICE_TOKEN)
    private readonly workflowToolService: WorkflowToolWorkspaceService | null,
  ) {}

  async buildToolIndex(
    workspaceId: string,
    roleId: string,
  ): Promise<ToolIndexEntry[]> {
    const index: ToolIndexEntry[] = [];

    const actionTools = await this.getActionToolIndex(workspaceId, roleId);

    index.push(...actionTools);

    const databaseTools = await this.getDatabaseToolIndex(workspaceId, roleId);

    index.push(...databaseTools);

    if (this.workflowToolService) {
      const workflowTools = this.getWorkflowToolIndex();

      index.push(...workflowTools);
    }

    this.logger.log(
      `Built tool index with ${index.length} tools for workspace ${workspaceId}`,
    );

    return index;
  }

  private getWorkflowToolIndex(): ToolIndexEntry[] {
    return WORKFLOW_TOOLS_METADATA.map((tool) => ({
      name: tool.name,
      description: tool.description,
      category: 'workflow' as const,
    }));
  }

  async searchTools(
    query: string,
    workspaceId: string,
    roleId: string,
    options: ToolSearchOptions = {},
  ): Promise<ToolIndexEntry[]> {
    const { limit = 5, category } = options;
    const index = await this.buildToolIndex(workspaceId, roleId);

    const queryLower = query.toLowerCase();
    const queryTerms = queryLower
      .split(/\s+/)
      .filter((term) => term.length > 2);

    const scored = index
      .filter((tool) => !category || tool.category === category)
      .map((tool) => {
        let score = 0;
        const nameLower = tool.name.toLowerCase();
        const descLower = tool.description.toLowerCase();
        const objectLower = tool.objectName?.toLowerCase() ?? '';

        // Exact name match - highest priority
        if (nameLower.includes(queryLower)) {
          score += 100;
        }

        // Object name match - high priority
        if (objectLower && queryLower.includes(objectLower)) {
          score += 80;
        }

        // Term matches in name
        for (const term of queryTerms) {
          if (nameLower.includes(term)) {
            score += 30;
          }
          if (objectLower.includes(term)) {
            score += 25;
          }
          if (descLower.includes(term)) {
            score += 10;
          }
        }

        // Operation keyword matches
        const operations = ['find', 'create', 'update', 'delete', 'search'];

        for (const op of operations) {
          if (queryLower.includes(op) && nameLower.includes(op)) {
            score += 40;
          }
        }

        return { tool, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.tool);

    this.logger.log(
      `Tool search for "${query}" returned ${scored.length} results`,
    );

    return scored;
  }

  async getToolsByName(
    names: string[],
    context: ToolContext,
  ): Promise<ToolSet> {
    const tools: ToolSet = {};
    const rolePermissionConfig: RolePermissionConfig = {
      unionOf: [context.roleId],
    };

    for (const name of names) {
      const tool = await this.getToolByName(
        name,
        context.workspaceId,
        rolePermissionConfig,
        context.actorContext,
      );

      if (tool) {
        tools[name] = tool;
      }
    }

    return tools;
  }

  private async getToolByName(
    name: string,
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
    actorContext?: ActorMetadata,
  ): Promise<ToolSet[string] | null> {
    const actionTool = this.getActionToolByName(name, workspaceId);

    if (actionTool) {
      return actionTool;
    }

    const workflowTool = await this.getWorkflowToolByName(
      name,
      workspaceId,
      rolePermissionConfig,
    );

    if (workflowTool) {
      return workflowTool;
    }

    const match = name.match(
      /^(find_one|soft_delete|find|create|update)_(.+)$/,
    );

    if (match) {
      const [, _operation, objectName] = match;
      const dbTools = await this.getDatabaseToolsForObject(
        workspaceId,
        rolePermissionConfig,
        objectName,
        actorContext,
      );

      return dbTools[name] ?? null;
    }

    return null;
  }

  private async getWorkflowToolByName(
    name: string,
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
  ): Promise<ToolSet[string] | null> {
    if (!this.workflowToolService) {
      return null;
    }

    const isWorkflowTool = WORKFLOW_TOOLS_METADATA.some(
      (tool) => tool.name === name,
    );

    if (!isWorkflowTool) {
      return null;
    }

    // Generate workflow tools and return the requested one
    const workflowTools = this.workflowToolService.generateWorkflowTools(
      workspaceId,
      rolePermissionConfig,
    );

    return workflowTools[name] ?? null;
  }

  private async getActionToolIndex(
    workspaceId: string,
    roleId: string,
  ): Promise<ToolIndexEntry[]> {
    const index: ToolIndexEntry[] = [];
    const rolePermissionConfig: RolePermissionConfig = {
      intersectionOf: [roleId],
    };

    // HTTP Request tool
    const hasHttpPermission = await this.permissionsService.hasToolPermission(
      rolePermissionConfig,
      workspaceId,
      PermissionFlagType.HTTP_REQUEST_TOOL,
    );

    if (hasHttpPermission) {
      index.push({
        name: 'http_request',
        description: this.httpTool.description,
        category: 'action',
      });
    }

    // Send Email tool
    const hasEmailPermission = await this.permissionsService.hasToolPermission(
      rolePermissionConfig,
      workspaceId,
      PermissionFlagType.SEND_EMAIL_TOOL,
    );

    if (hasEmailPermission) {
      index.push({
        name: 'send_email',
        description: this.sendEmailTool.description,
        category: 'action',
      });
    }

    index.push({
      name: 'search_articles',
      description: this.searchArticlesTool.description,
      category: 'action',
    });

    return index;
  }

  private getActionToolByName(
    name: string,
    workspaceId: string,
  ): ToolSet[string] | null {
    switch (name) {
      case 'http_request':
        return {
          description: this.httpTool.description,
          inputSchema: this.httpTool.inputSchema,
          execute: async (parameters: {
            input: z.infer<typeof this.httpTool.inputSchema>['input'];
          }) => this.httpTool.execute(parameters.input, workspaceId),
        };
      case 'send_email':
        return {
          description: this.sendEmailTool.description,
          inputSchema: this.sendEmailTool.inputSchema,
          execute: async (parameters: {
            input: z.infer<typeof this.sendEmailTool.inputSchema>['input'];
          }) => this.sendEmailTool.execute(parameters.input, workspaceId),
        };
      case 'search_articles':
        return {
          description: this.searchArticlesTool.description,
          inputSchema: this.searchArticlesTool.inputSchema,
          execute: async (parameters: {
            input: z.infer<typeof this.searchArticlesTool.inputSchema>['input'];
          }) => this.searchArticlesTool.execute(parameters.input),
        };
      default:
        return null;
    }
  }

  private async getDatabaseToolIndex(
    workspaceId: string,
    roleId: string,
  ): Promise<ToolIndexEntry[]> {
    const index: ToolIndexEntry[] = [];

    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    const objectPermissions = rolesPermissions[roleId];

    if (!objectPermissions) {
      return index;
    }

    const { flatObjectMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        },
      );

    const allFlatObjects = Object.values(flatObjectMetadataMaps.byId)
      .filter(isDefined)
      .filter((obj) => obj.isActive && !obj.isSystem);

    for (const flatObject of allFlatObjects) {
      if (isWorkflowRelatedObject(flatObject)) {
        continue;
      }

      const permission = objectPermissions[flatObject.id];

      if (!permission) {
        continue;
      }

      const objectNameSingular = flatObject.nameSingular;
      const objectNamePlural = flatObject.namePlural;
      const objectLabelSingular = flatObject.labelSingular;
      const objectLabelPlural = flatObject.labelPlural;

      if (permission.canReadObjectRecords) {
        index.push({
          name: `find_${objectNamePlural}`,
          description: `Search and find ${objectLabelPlural}`,
          category: 'database',
          objectName: objectNameSingular,
          operation: 'find',
        });

        index.push({
          name: `find_one_${objectNameSingular}`,
          description: `Get a single ${objectLabelSingular} by ID`,
          category: 'database',
          objectName: objectNameSingular,
          operation: 'find_one',
        });
      }

      if (permission.canUpdateObjectRecords) {
        index.push({
          name: `create_${objectNameSingular}`,
          description: `Create a new ${objectLabelSingular}`,
          category: 'database',
          objectName: objectNameSingular,
          operation: 'create',
        });

        index.push({
          name: `update_${objectNameSingular}`,
          description: `Update an existing ${objectLabelSingular}`,
          category: 'database',
          objectName: objectNameSingular,
          operation: 'update',
        });
      }

      if (permission.canSoftDeleteObjectRecords) {
        index.push({
          name: `soft_delete_${objectNameSingular}`,
          description: `Soft delete a ${objectLabelSingular}`,
          category: 'database',
          objectName: objectNameSingular,
          operation: 'soft_delete',
        });
      }
    }

    return index;
  }

  private async getDatabaseToolsForObject(
    workspaceId: string,
    rolePermissionConfig: RolePermissionConfig,
    objectName: string,
    actorContext?: ActorMetadata,
  ): Promise<ToolSet> {
    const { rolesPermissions } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'rolesPermissions',
      ]);

    let objectPermissions;

    if ('intersectionOf' in rolePermissionConfig) {
      const allRolePermissions = rolePermissionConfig.intersectionOf.map(
        (roleId: string) => rolesPermissions[roleId],
      );

      objectPermissions =
        allRolePermissions.length === 1
          ? allRolePermissions[0]
          : computePermissionIntersection(allRolePermissions);
    } else if ('unionOf' in rolePermissionConfig) {
      if (rolePermissionConfig.unionOf.length === 1) {
        objectPermissions = rolesPermissions[rolePermissionConfig.unionOf[0]];
      } else {
        throw new Error(
          'Union permission logic for multiple roles not yet implemented',
        );
      }
    } else {
      return {};
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    const flatObject = Object.values(flatObjectMetadataMaps.byId)
      .filter(isDefined)
      .find(
        (obj) =>
          obj.nameSingular === objectName || obj.namePlural === objectName,
      );

    if (!flatObject) {
      return {};
    }

    const permission = objectPermissions[flatObject.id];

    if (!permission) {
      return {};
    }

    const objectMetadata = {
      ...flatObject,
      fields: getFlatFieldsFromFlatObjectMetadata(
        flatObject,
        flatFieldMetadataMaps,
      ),
    };

    const factory = createDirectRecordToolsFactory({
      createRecordService: this.createRecordService,
      updateRecordService: this.updateRecordService,
      deleteRecordService: this.deleteRecordService,
      findRecordsService: this.findRecordsService,
    });

    return factory(
      {
        objectMetadata,
        restrictedFields: permission.restrictedFields,
        canCreate: permission.canUpdateObjectRecords,
        canRead: permission.canReadObjectRecords,
        canUpdate: permission.canUpdateObjectRecords,
        canDelete: permission.canSoftDeleteObjectRecords,
      },
      {
        workspaceId,
        rolePermissionConfig,
        actorContext,
      },
    );
  }
}
