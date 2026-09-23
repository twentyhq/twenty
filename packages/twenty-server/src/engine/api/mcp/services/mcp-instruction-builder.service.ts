import { Injectable } from '@nestjs/common';

import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { MCP_EXCLUDED_TOOL_NAMES } from 'src/engine/api/mcp/constants/mcp-excluded-tool-names.const';
import { buildMcpServerInstructions } from 'src/engine/api/mcp/utils/build-mcp-server-instructions.util';
import { ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { collapseDatabaseCrudTools } from 'src/engine/core-modules/tool-provider/utils/collapse-database-crud-tools.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { SkillService } from 'src/engine/metadata-modules/skill/skill.service';

const WRITE_OPERATION_PREFIXES = ['create', 'update', 'upsert'];

@Injectable()
export class McpInstructionBuilderService {
  constructor(
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
    const [allSkills, toolCatalog] = await Promise.all([
      this.skillService.findAllFlatSkills(workspaceId),
      // The advertised surface is read off the role-filtered index so it cannot
      // name objects or tools this caller will never be able to reach.
      this.toolRegistry.buildToolIndex(workspaceId, roleId, {
        rolePermissionConfig,
        excludeTools: MCP_EXCLUDED_TOOL_NAMES,
      }),
    ]);

    const toolNamesByCategory: Partial<Record<ToolCategory, string[]>> = {};
    const databaseCrudEntries: ToolIndexEntry[] = [];

    for (const entry of toolCatalog as ToolIndexEntry[]) {
      if (entry.category === ToolCategory.DATABASE_CRUD) {
        databaseCrudEntries.push(entry);
        continue;
      }

      toolNamesByCategory[entry.category] = [
        ...(toolNamesByCategory[entry.category] ?? []),
        entry.name,
      ];
    }

    const { objectGroups } = collapseDatabaseCrudTools(databaseCrudEntries);

    const pluralNamesOf = (groups: typeof objectGroups): string[] =>
      groups
        .flatMap((group) => group.objects)
        .map((object) => object.plural)
        .filter(isDefined)
        .sort();

    const objectNames = pluralNamesOf(objectGroups).join(', ');

    const readOnlyGroups = objectGroups.filter(
      (group) =>
        !group.operations.some((operation) =>
          WRITE_OPERATION_PREFIXES.some((prefix) =>
            operation.startsWith(prefix),
          ),
        ),
    );
    const readOnlyObjectNames = pluralNamesOf(readOnlyGroups).join(', ');

    const skillNames =
      allSkills.length > 0
        ? allSkills.map((skill) => skill.name).join(', ')
        : undefined;

    return buildMcpServerInstructions({
      objectNames,
      ...(readOnlyObjectNames.length > 0 && { readOnlyObjectNames }),
      toolNamesByCategory,
      skillNames,
    });
  }
}
