import { asSchema, type ToolExecuteFunction, type ToolSet } from 'ai';
import { type ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

// For providers whose tools are opaque AI-SDK ToolSet closures and so cannot dispatch by executionRef.
export const executeToolFromToolSet = async (
  toolSet: ToolSet,
  toolName: string,
  args: Record<string, unknown>,
  category: ToolCategory,
): Promise<ToolOutput> => {
  const tool = toolSet[toolName];

  if (!tool?.execute) {
    throw new Error(
      `Tool "${toolName}" not found in ToolSet for category "${category}"`,
    );
  }

  // The AI SDK only validates input for tools it calls itself, not for registry dispatch.
  const validation = await asSchema(tool.inputSchema).validate?.(args);

  if (isDefined(validation) && !validation.success) {
    return buildInvalidToolArgumentsOutput({
      toolName,
      error: validation.error,
    });
  }

  // ToolSet widens execute to a union no argument satisfies; these tools take no per-tool context.
  const execute = tool.execute as ToolExecuteFunction<
    unknown,
    ToolOutput,
    undefined
  >;

  return execute(isDefined(validation) ? validation.value : args, {
    toolCallId: '',
    messages: [],
    context: undefined,
  }) as Promise<ToolOutput>;
};
