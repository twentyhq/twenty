import { z } from 'zod';

import {
  type ToolContext,
  type ToolRegistryService,
} from 'src/engine/core-modules/tool-provider/services/tool-registry.service';

export const LEARN_TOOLS_TOOL_NAME = 'learn_tools';

const learnToolsAspectSchema = z.enum(['description', 'schema']);

export type LearnToolsAspect = z.infer<typeof learnToolsAspectSchema>;

export const learnToolsInputSchema = z.object({
  toolNames: z
    .array(z.string())
    .describe(
      'Tool names to learn about. Use exact names from the tool catalog.',
    ),
  aspects: z
    .array(learnToolsAspectSchema)
    .optional()
    .default(['description', 'schema'])
    .describe('What to learn: description, schema, or both.'),
});

export type LearnToolsInput = z.infer<typeof learnToolsInputSchema>;

export type LearnToolsResultEntry = {
  name: string;
  description?: string;
  inputSchema?: object;
};

export type LearnToolsResult = {
  tools: LearnToolsResultEntry[];
  notFound: string[];
  message: string;
};

export const createLearnToolsTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
) => ({
  description:
    'Learn about tools before using them. Returns tool descriptions and/or input schemas so you know how to call them via execute_tool.',
  inputSchema: learnToolsInputSchema,
  execute: async (parameters: LearnToolsInput): Promise<LearnToolsResult> => {
    const { toolNames, aspects } = parameters;

    const toolInfos = await toolRegistry.getToolInfo(
      toolNames,
      context,
      aspects,
    );

    const foundNames = new Set(toolInfos.map((t) => t.name));
    const notFound = toolNames.filter((name) => !foundNames.has(name));

    if (notFound.length > 0) {
      return {
        tools: toolInfos,
        notFound,
        message: `Learned ${toolInfos.length} tool(s). Could not find: ${notFound.join(', ')}.`,
      };
    }

    return {
      tools: toolInfos,
      notFound: [],
      message: `Learned ${toolInfos.length} tool(s): ${toolInfos.map((t) => t.name).join(', ')}.`,
    };
  },
});
