import { z } from 'zod';

import { ToolCategory } from 'twenty-shared/ai';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config';

export const GET_TOOL_CATALOG_TOOL_NAME = 'get_tool_catalog';

const availableCategories = Object.values(ToolCategory)
  .map((entry) => entry.toString())
  .join(', ');

export const getToolCatalogInputSchema = z.object({
  categories: z
    .array(z.string())
    .optional()
    .describe(
      `Filter by category. Available categories: ${availableCategories}. Omit to get all.`,
    ),
});

export type GetToolCatalogInput = z.infer<typeof getToolCatalogInputSchema>;

export type GetToolCatalogResult = {
  catalog: Record<string, Array<{ name: string; description: string }>>;
  message: string;
};

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
    'Fallback discovery — use only when you do not know which tool exists. You do not need this for record operations: build the name from the grammar ({operation}_{object}, e.g. find_many_people) and pass it straight to learn_tools, which returns the closest matching names when a name is wrong. Pass ONE category to keep the response small.',
  inputSchema: getToolCatalogInputSchema,
  execute: async (
    parameters: GetToolCatalogInput,
  ): Promise<GetToolCatalogResult> => {
    const entries = await toolRegistry.buildToolIndex(
      workspaceId,
      roleId,
      options,
    );

    const categoryFilter = parameters.categories
      ? new Set(parameters.categories)
      : undefined;

    const excludeSet = options?.excludeTools;

    const catalog: Record<
      string,
      Array<{ name: string; description: string }>
    > = {};

    for (const entry of entries as ToolIndexEntry[]) {
      if (excludeSet?.has(entry.name)) {
        continue;
      }

      if (categoryFilter && !categoryFilter.has(entry.category)) {
        continue;
      }

      if (!catalog[entry.category]) {
        catalog[entry.category] = [];
      }

      catalog[entry.category].push({
        name: entry.name,
        description: entry.description,
      });
    }

    const totalTools = Object.values(catalog).reduce(
      (sum, tools) => sum + tools.length,
      0,
    );

    return {
      catalog,
      message: `Found ${totalTools} tool(s) across ${Object.keys(catalog).length} category(ies).`,
    };
  },
});
