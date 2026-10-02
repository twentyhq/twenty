import { isNonEmptyString } from '@sniptt/guards';
import { jsonSchema } from 'ai';
import { type JSONSchema7 } from 'json-schema';
import { z } from 'zod';

import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const EXECUTE_TOOL_TOOL_NAME = 'execute_tool';

const executeToolInputZodSchema = z.object({
  toolName: z.string().describe('Tool name, as confirmed by learn_tools.'),
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

export const createExecuteToolTool = (
  toolRegistry: ToolRegistryService,
  context: ToolContext,
  options?: {
    isToolAllowed?: (toolName: string) => boolean;
    compactOutput?: boolean;
    spillLargeOutput?: boolean;
  },
) => ({
  description:
    'Execute a tool by name with arguments. Call learn_tools first to discover the required input schema.',
  inputSchema: executeToolInputSchema,
  execute: async (parameters: ExecuteToolInput): Promise<ToolOutput> => {
    if (!isNonEmptyString(parameters?.toolName)) {
      return {
        success: false,
        message: 'Tool name is required',
        error:
          'Tool name is required. Pass the tool name confirmed by learn_tools as toolName.',
      };
    }

    const { toolName, arguments: args = {} } = parameters;

    if (options?.isToolAllowed?.(toolName) === false) {
      return {
        success: false,
        message: `Tool "${toolName}" is not available`,
        error: `Tool "${toolName}" is not available in this context and cannot be called here. Do not retry it.`,
      };
    }

    return toolRegistry.resolveAndExecute(toolName, args, context, {
      compactOutput: options?.compactOutput,
      spillLargeOutput: options?.spillLargeOutput,
    });
  },
});
