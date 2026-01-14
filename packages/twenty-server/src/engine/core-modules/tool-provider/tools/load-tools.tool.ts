import { z } from 'zod';

import {
  type ToolContext,
  type ToolRegistryService,
} from 'src/engine/core-modules/tool-provider/services/tool-registry.service';

export const LOAD_TOOLS_TOOL_NAME = 'load_tools' as const;

export const loadToolsInputSchema = z.object({
  toolNames: z
    .array(z.string())
    .describe(
      'Array of tool names to load. Use the exact names from the tool catalog.',
    ),
});

export type LoadToolsInput = z.infer<typeof loadToolsInputSchema>;

export type LoadToolsResult = {
  loaded: string[];
  notFound: string[];
  message: string;
};

export type DynamicToolStore = {
  loadedTools: Set<string>;
};

export const createLoadToolsTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
  dynamicToolStore: DynamicToolStore,
  onToolsLoaded: (toolNames: string[]) => Promise<void>,
) => ({
  description: `Load tools by name to make them available for use. Call this when you need to use a tool from the catalog that isn't already loaded. You can load multiple tools at once.`,
  inputSchema: loadToolsInputSchema,
  execute: async (parameters: LoadToolsInput): Promise<LoadToolsResult> => {
    const { toolNames } = parameters;

    const loaded: string[] = [];
    const notFound: string[] = [];

    const tools = await toolRegistry.getToolsByName(toolNames, context);

    for (const name of toolNames) {
      if (tools[name]) {
        loaded.push(name);
        dynamicToolStore.loadedTools.add(name);
      } else {
        notFound.push(name);
      }
    }

    if (loaded.length > 0) {
      await onToolsLoaded(loaded);
    }

    if (notFound.length > 0) {
      return {
        loaded,
        notFound,
        message: `Loaded ${loaded.length} tool(s). Could not find: ${notFound.join(', ')}. Check the tool catalog for correct names.`,
      };
    }

    return {
      loaded,
      notFound: [],
      message: `Successfully loaded ${loaded.length} tool(s): ${loaded.join(', ')}. These tools are now available for use.`,
    };
  },
});
