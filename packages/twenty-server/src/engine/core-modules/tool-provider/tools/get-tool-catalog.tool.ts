import { isNonEmptyString } from '@sniptt/guards';
import { z } from 'zod';

import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { rankToolIndexEntries } from 'src/engine/core-modules/tool-provider/utils/rank-tool-index-entries.util';
import { type RolePermissionConfig } from 'src/engine/twenty-orm/types/role-permission-config.type';

export const GET_TOOL_CATALOG_TOOL_NAME = 'get_tool_catalog';

const DEFAULT_QUERY_MATCH_LIMIT = 5;
const MAX_QUERY_MATCH_LIMIT = 25;
const MAX_QUERY_LENGTH = 200;

const availableCategories = Object.values(ToolCategory)
  .map((entry) => entry.toString())
  .join(', ');

export const getToolCatalogInputSchema = z.object({
  query: z
    .string()
    .max(MAX_QUERY_LENGTH)
    .optional()
    .describe(
      `What you want to do, in a few words (e.g. "create task", "workflow runs"; max ${MAX_QUERY_LENGTH} characters). Returns only the best-matching tools, ranked.`,
    ),
  limit: z
    .number()
    .int()
    .min(1)
    .max(MAX_QUERY_MATCH_LIMIT)
    .optional()
    .describe(
      `Maximum number of matches to return (1-${MAX_QUERY_MATCH_LIMIT}, default ${DEFAULT_QUERY_MATCH_LIMIT}). Only applies when query is given.`,
    ),
  categories: z
    .array(z.enum(ToolCategory))
    .optional()
    .describe(
      'Restrict to these categories. Without query, returns every tool in them. Omit to cover all categories.',
    ),
});

export type GetToolCatalogInput = z.infer<typeof getToolCatalogInputSchema>;

type ToolCatalogEntry = { name: string; description: string };

type ToolCatalogMatch = ToolCatalogEntry & { category: ToolCategory };

export type GetToolCatalogResult =
  | {
      catalog: Record<string, ToolCatalogEntry[]>;
      message: string;
    }
  | {
      matches: ToolCatalogMatch[];
      totalMatches: number;
      truncated: boolean;
      message: string;
    }
  | {
      success: false;
      message: string;
      error: string;
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
    application?: FlatApplication;
  },
) => ({
  description:
    'Fallback discovery — use only when you do not know which tool exists. You do not need this for record operations: build the name from the grammar ({operation}_{object}, e.g. find_many_people) and pass it straight to learn_tools, which returns the closest matching names when a name is wrong. Pass query (e.g. "workflow runs") to get the top matches, or ONE category to browse; with no arguments it returns every tool (often hundreds).',
  inputSchema: getToolCatalogInputSchema,
  execute: async (
    parameters: GetToolCatalogInput,
  ): Promise<GetToolCatalogResult> => {
    // MCP hands raw client arguments to execute without schema validation.
    const parseResult = getToolCatalogInputSchema.safeParse(parameters ?? {});

    if (!parseResult.success) {
      return {
        success: false,
        message: 'Invalid input for get_tool_catalog',
        error: `${parseResult.error.issues
          .map(
            (issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`,
          )
          .join('; ')}. Valid categories: ${availableCategories}.`,
      };
    }

    const { query, limit, categories } = parseResult.data;

    if (isDefined(query) && !isNonEmptyString(query.trim())) {
      return {
        matches: [],
        totalMatches: 0,
        truncated: false,
        message:
          'query is empty. Pass a few words naming the operation and object (e.g. "create task"), or use categories to browse one area.',
      };
    }

    const entries = await toolRegistry.buildToolIndex(workspaceId, roleId, {
      ...options,
      categories: isDefined(categories) ? [...new Set(categories)] : undefined,
    });

    if (isDefined(query)) {
      const { matches, totalMatches } = rankToolIndexEntries({
        entries,
        query,
        limit: limit ?? DEFAULT_QUERY_MATCH_LIMIT,
      });

      return {
        matches: matches.map((entry) => ({
          name: entry.name,
          category: entry.category,
          description: entry.description,
        })),
        totalMatches,
        truncated: totalMatches > matches.length,
        message:
          matches.length > 0
            ? `Showing ${matches.length} of ${totalMatches} match(es) for "${query}". Pass the names you need to learn_tools to get their arguments.`
            : `No tools matched "${query}". Rephrase with an operation and an object (e.g. "create task", "find companies"), or browse with categories: ${availableCategories}.`,
      };
    }

    const catalog: Record<string, ToolCatalogEntry[]> = {};

    for (const entry of entries) {
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
      message: `Found ${totalTools} tool(s) across ${Object.keys(catalog).length} category(ies). Tip: pass query (e.g. "create task") to get only the top matches.`,
    };
  },
});
