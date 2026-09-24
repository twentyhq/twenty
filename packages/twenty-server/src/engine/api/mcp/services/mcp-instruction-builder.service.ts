import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import {
  camelToSnakeCase,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';

import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import { MCP_EXCLUDED_TOOL_NAMES } from 'src/engine/api/mcp/constants/mcp-excluded-tool-names.constant';
import { ToolCategory } from 'src/engine/core-modules/tool-provider/enums/tool-category.enum';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { getDatabaseCrudToolFlatObjects } from 'src/engine/core-modules/tool-provider/utils/get-database-crud-tool-flat-objects.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

@Injectable()
export class McpInstructionBuilderService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly skillService: SkillService,
    private readonly toolRegistry: ToolRegistryService,
  ) {}

  async buildInstructions({
    workspaceId,
    roleId,
    rolePermissionConfig,
    workspaceInstructions,
  }: {
    workspaceId: string;
    roleId: string;
    rolePermissionConfig: RolePermissionConfig;
    workspaceInstructions?: string;
  }): Promise<string> {
    const [{ flatObjectMetadataMaps }, allSkills, actionToolCatalog] =
      await Promise.all([
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        }),
        this.skillService.findAllFlatSkills(workspaceId),
        this.toolRegistry.buildToolIndex(workspaceId, roleId, {
          rolePermissionConfig,
          categories: [ToolCategory.ACTION],
        }),
      ]);

    const objectNames = getDatabaseCrudToolFlatObjects(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .map((obj) => camelToSnakeCase(obj.namePlural))
      .sort()
      .join(', ');

    const actionToolNames = actionToolCatalog
      .map((entry) => entry.name)
      .filter((name) => !MCP_EXCLUDED_TOOL_NAMES.has(name));

    const skillNames =
      allSkills.length > 0
        ? allSkills.map((skill) => skill.name).join(', ')
        : undefined;

    const formattedWorkspaceInstructions = isNonEmptyString(
      workspaceInstructions,
    )
      ? tipTapDocumentToMarkdown(workspaceInstructions).trim()
      : undefined;

    return buildMcpServerInstructions({
      objectNames,
      actionToolNames,
      skillNames,
      workspaceInstructions: isNonEmptyString(formattedWorkspaceInstructions)
        ? formattedWorkspaceInstructions
        : undefined,
    });
  }
}
