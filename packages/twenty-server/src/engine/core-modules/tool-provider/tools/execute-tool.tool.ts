import { type ToolCallOptions } from 'ai';
import { z } from 'zod';

import {
  type ToolContext,
  type ToolRegistryService,
} from 'src/engine/core-modules/tool-provider/services/tool-registry.service';

export const EXECUTE_TOOL_TOOL_NAME = 'execute_tool' as const;

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
) => ({
  description:
    'Execute a tool by name. Use learn_tools first to discover the correct schema, then call this with the tool name and arguments.',
  inputSchema: executeToolInputSchema,
  execute: async (
    parameters: ExecuteToolInput,
    options: ToolCallOptions,
  ): Promise<ExecuteToolResult> => {
    const { toolName, arguments: args } = parameters;

    return toolRegistry.resolveAndExecute(toolName, args, context, options);
  },
});

