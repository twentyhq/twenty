import { Injectable } from '@nestjs/common';

import { ToolCategory } from 'twenty-shared/ai';

import { MCP_EXCLUDED_TOOL_NAMES } from 'src/engine/api/mcp/constants/mcp-excluded-tool-names.const';
import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import { getMcpObjectNameForms } from 'src/engine/api/mcp/utils/get-mcp-object-name-forms.util';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

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
  }: {
    workspaceId: string;
    roleId: string;
    rolePermissionConfig: RolePermissionConfig;
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

    const objects = getMcpObjectNameForms(flatObjectMetadataMaps);

    const actionToolNames = actionToolCatalog
      .map((entry) => entry.name)
      .filter((name) => !MCP_EXCLUDED_TOOL_NAMES.has(name));

    const skillNames =
      allSkills.length > 0
        ? allSkills.map((skill) => skill.name).join(', ')
        : undefined;

    return buildMcpServerInstructions({
      objects,
      actionToolNames,
      skillNames,
    });
  }
}
