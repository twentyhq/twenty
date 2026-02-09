import { type ToolCallOptions, type ToolSet } from 'ai';
import { z } from 'zod';

import {
  type ToolContext,
  type ToolRegistryService,
} from 'src/engine/core-modules/tool-provider/services/tool-registry.service';

export const EXECUTE_TOOL_TOOL_NAME = 'execute_tool';

export const executeToolInputSchema = z.object({
  toolName: z.string().describe('Exact name of the tool to execute.'),
  arguments: z
    .record(z.string(), z.unknown())
    .describe(
      'Arguments to pass to the tool. Must match the schema from learn_tools.',
    ),
});

export type ExecuteToolInput = z.infer<typeof executeToolInputSchema>;

export type ExecuteToolResult = {
  toolName: string;
  result?: unknown;
  error?: {
    message: string;
    suggestion: string;
  };
};

export const createExecuteToolTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
  directTools?: ToolSet,
) => ({
  description:
    'Execute a tool by name. Use learn_tools first to discover the correct schema, then call this with the tool name and arguments.',
  inputSchema: executeToolInputSchema,
  execute: async (
    parameters: ExecuteToolInput,
    options: ToolCallOptions,
  ): Promise<ExecuteToolResult> => {
    const { toolName, arguments: args } = parameters;

    // Native provider tools and preloaded tools are already in the ToolSet;
    // dispatch directly if the LLM routes them through execute_tool.
    const directTool = directTools?.[toolName];

    if (directTool?.execute) {
      const result = await directTool.execute(args, options);

      return { toolName, result };
    }

    return toolRegistry.resolveAndExecute(toolName, args, context, options);
  },
});
