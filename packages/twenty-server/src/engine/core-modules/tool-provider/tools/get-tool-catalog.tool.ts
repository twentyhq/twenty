import { z } from 'zod';

import { ToolCategory } from 'twenty-shared/ai';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import {
  collapseDatabaseCrudTools,
  DATABASE_CRUD_NAME_GRAMMAR,
  type CollapsedDatabaseCrudTools,
} from 'src/engine/core-modules/tool-provider/utils/collapse-database-crud-tools.util';

export const GET_TOOL_CATALOG_TOOL_NAME = 'get_tool_catalog';

const availableCategories = Object.values(ToolCategory)
  .map((entry) => entry.toString())
  .join(', ');

export const getToolCatalogInputSchema = z.object({
  categories: z
    .array(z.string())
    .optional()
    .describe(
      `Filter by category. Available categories: ${availableCategories}. Pass a single category; omitting this returns every tool and is large enough that most clients truncate it.`,
    ),
});

export type GetToolCatalogInput = z.infer<typeof getToolCatalogInputSchema>;

export type GetToolCatalogDatabaseCrudTools = Omit<
  CollapsedDatabaseCrudTools,
  'standaloneTools'
> & {
  nameGrammar: string;
  standaloneTools: Array<{ name: string; description: string }>;
};

export type GetToolCatalogResult = {
  catalog: Record<string, Array<{ name: string; description: string }>>;
  databaseCrudTools?: GetToolCatalogDatabaseCrudTools;
  message: string;
};

const toCatalogEntry = ({ name, description }: ToolIndexEntry) => ({
  name,
  description,
});

export const createGetToolCatalogTool = (
  toolRegistry: ToolRegistryService,
  workspaceId: string,
  roleId: string,
  options?: {
    rolePermissionConfig?: RolePermissionConfig;
    userId?: string;
    userWorkspaceId?: string;
    excludeTools?: Set<string>;
  },
) => ({
  description:
    'Fallback discovery — use only when you do not know which tool exists. You do not need this for record operations: build the name from the grammar ({operation}_{object}, e.g. find_many_people) and pass it straight to learn_tools, which returns the closest matching names when a name is wrong. Pass ONE category to keep the response small. Record operations come back under databaseCrudTools as an operations-per-object grammar rather than one entry per tool; call learn_tools for a tool description and input schema.',
  inputSchema: getToolCatalogInputSchema,
  execute: async (
    parameters: GetToolCatalogInput,
  ): Promise<GetToolCatalogResult> => {
    const requestedCategories = parameters.categories?.filter(
      (category): category is ToolCategory =>
        Object.values(ToolCategory).includes(category as ToolCategory),
    );

    const entries = (await toolRegistry.buildToolIndex(workspaceId, roleId, {
      ...options,
      // Pushed down so providers for unrequested categories never generate
      // descriptors, instead of building all of them and filtering after.
      ...(requestedCategories && { categories: requestedCategories }),
    })) as ToolIndexEntry[];

    const catalog: Record<
      string,
      Array<{ name: string; description: string }>
    > = {};
    const databaseCrudEntries: ToolIndexEntry[] = [];

    for (const entry of entries) {
      if (entry.category === ToolCategory.DATABASE_CRUD) {
        databaseCrudEntries.push(entry);
        continue;
      }

      if (!catalog[entry.category]) {
        catalog[entry.category] = [];
      }

      catalog[entry.category].push(toCatalogEntry(entry));
    }

    const categoryCount =
      Object.keys(catalog).length + (databaseCrudEntries.length > 0 ? 1 : 0);

    if (databaseCrudEntries.length === 0) {
      return {
        catalog,
        message: `Found ${entries.length} tool(s) across ${categoryCount} category(ies).`,
      };
    }

    const { standaloneTools, ...collapsed } =
      collapseDatabaseCrudTools(databaseCrudEntries);

    return {
      catalog,
      databaseCrudTools: {
        ...collapsed,
        nameGrammar: DATABASE_CRUD_NAME_GRAMMAR,
        standaloneTools: standaloneTools.map(toCatalogEntry),
      },
      message: `Found ${entries.length} tool(s) across ${categoryCount} category(ies). The ${databaseCrudEntries.length} ${ToolCategory.DATABASE_CRUD} tool(s) are listed under databaseCrudTools as an operations-per-object grammar.`,
    };
  },
});
