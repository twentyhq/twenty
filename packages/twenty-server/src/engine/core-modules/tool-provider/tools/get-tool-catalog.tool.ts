import { z } from 'zod';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';

export const GET_TOOL_CATALOG_TOOL_NAME = 'get_tool_catalog';

export const getToolCatalogInputSchema = z.object({
  categories: z
    .array(z.string())
    .optional()
    .describe(
      'Filter by category (e.g. DATABASE_CRUD, METADATA, VIEW, WORKFLOW, DASHBOARD, LOGIC_FUNCTION, ACTION). Omit to get all.',
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
    userId?: string;
    userWorkspaceId?: string;
    excludeTools?: Set<string>;
  },
) => ({
  description:
    'STEP 1: Start here. Browse available tools by category. Returns tool names and descriptions. You MUST call this before using learn_tools or execute_tool — do not guess tool names.',
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
