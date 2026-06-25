import { jsonSchema } from 'ai';
import { type JSONSchema7 } from 'json-schema';
import { z } from 'zod';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const EXECUTE_TOOL_TOOL_NAME = 'execute_tool';

const executeToolInputZodSchema = z.object({
  toolName: z.string().describe('Exact tool name. Do not guess.'),
  arguments: z
    .record(z.string(), z.unknown())
    .describe('Arguments matching the schema returned by learn_tools.'),
});

export type ExecuteToolInput = z.infer<typeof executeToolInputZodSchema>;

export const executeToolInputSchema = jsonSchema<ExecuteToolInput>(
  () => {
    const schema = z.toJSONSchema(executeToolInputZodSchema, {
      target: 'draft-7',
      io: 'input',
    }) as JSONSchema7;

    schema.additionalProperties = false;

    return schema;
  },
  {
    validate: async (value) => {
      const result = await z.safeParseAsync(executeToolInputZodSchema, value);

      return result.success
        ? { success: true, value: result.data }
        : { success: false, error: result.error };
    },
  },
);

// All invocations route through the registry — there is no fast path for
// preloaded or native tools. Native tools are exposed to the model directly
// via the top-level ToolSet passed to streamText, not through this meta-tool.
export const createExecuteToolTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
  options?: {
    excludeTools?: Set<string>;
    compactOutput?: boolean;
    spillLargeOutput?: boolean;
  },
) => ({
  description:
    'Execute a tool by name with arguments. Call learn_tools first to discover the required input schema.',
  inputSchema: executeToolInputSchema,
  execute: async (parameters: ExecuteToolInput): Promise<ToolOutput> => {
    const { toolName, arguments: args = {} } = parameters;

    if (options?.excludeTools?.has(toolName)) {
      return {
        success: false,
        message: `Tool "${toolName}" is not available`,
        error: `Tool "${toolName}" is not available in this context. Use get_tool_catalog to discover available tools.`,
      };
    }

    return toolRegistry.resolveAndExecute(toolName, args, context, {
      compactOutput: options?.compactOutput,
      spillLargeOutput: options?.spillLargeOutput,
    });
  },
});
