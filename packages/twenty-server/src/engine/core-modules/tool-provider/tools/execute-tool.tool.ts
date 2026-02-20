import { type ToolCallOptions, type ToolSet } from 'ai';
import { z } from 'zod';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';

export const EXECUTE_TOOL_TOOL_NAME = 'execute_tool';

export const executeToolInputSchema = z.object({
  toolName: z
    .string()
    .describe('Exact tool name from get_tool_catalog. Do not guess.'),
  arguments: z
    .record(z.string(), z.unknown())
    .describe('Arguments matching the schema returned by learn_tools.'),
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
  excludeTools?: Set<string>,
) => ({
  description:
    'STEP 3: Execute a tool by name with arguments. You MUST call get_tool_catalog (step 1) and learn_tools (step 2) first to discover the tool name and its required input schema.',
  inputSchema: executeToolInputSchema,
  execute: async (
    parameters: ExecuteToolInput,
    options: ToolCallOptions,
  ): Promise<ExecuteToolResult> => {
    const { toolName, arguments: args } = parameters;

    if (excludeTools?.has(toolName)) {
      return {
        toolName,
        error: {
          message: `Tool "${toolName}" is not available in this context.`,
          suggestion: 'Use get_tool_catalog to see which tools are available.',
        },
      };
    }

    const directTool = directTools?.[toolName];

    if (directTool?.execute) {
      const result = await directTool.execute(args, options);

      return { toolName, result };
    }

    return toolRegistry.resolveAndExecute(toolName, args, context, options);
  },
});
