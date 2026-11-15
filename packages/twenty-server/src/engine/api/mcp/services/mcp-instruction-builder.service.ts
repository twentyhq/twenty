import { Injectable } from '@nestjs/common';

import { ToolCategory } from 'twenty-shared/ai';
import { camelToSnakeCase } from 'twenty-shared/utils';

import { MCP_EXCLUDED_TOOL_NAMES } from 'src/engine/api/mcp/constants/mcp-excluded-tool-names.constant';
import { type McpToolMode } from 'src/engine/api/mcp/types/mcp-tool-mode.type';
import { buildMcpGenericModeInstructions } from 'src/engine/api/mcp/utils/build-mcp-generic-mode-instructions.util';
import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { getDatabaseCrudToolFlatObjects } from 'src/engine/metadata-modules/ai/ai-agent/utils/get-database-crud-tool-flat-objects.util';
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
    authContext,
    toolMode,
  }: {
    workspaceId: string;
    authContext: WorkspaceAuthContext;
    toolMode: McpToolMode;
  }): Promise<string> {
    if (toolMode === 'generic') {
      return buildMcpGenericModeInstructions();
    }

    const [{ flatObjectMetadataMaps }, allSkills, actionToolCatalog] =
      await Promise.all([
        this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps({
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps'],
        }),
        this.skillService.findAllFlatSkills(workspaceId),
        this.toolRegistry.buildToolIndex(workspaceId, {
          authContext,
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

    return buildMcpServerInstructions({
      objectNames,
      actionToolNames,
      skillNames,
      isDirectMode: toolMode === 'direct',
    });
  }
}
