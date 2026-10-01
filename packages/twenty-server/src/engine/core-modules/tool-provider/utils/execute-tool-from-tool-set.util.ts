import { type ToolExecuteFunction, type ToolSet } from 'ai';
import { type ToolCategory } from 'twenty-shared/ai';

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

  // ToolSet widens execute to a union no argument satisfies.
  const execute = tool.execute as ToolExecuteFunction<
    Record<string, unknown>,
    ToolOutput,
    undefined
  >;

  return execute(args, {
    toolCallId: '',
    messages: [],
    context: undefined,
  }) as Promise<ToolOutput>;
};
