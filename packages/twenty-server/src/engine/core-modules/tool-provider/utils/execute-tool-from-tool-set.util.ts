import { type ToolSet } from 'ai';
import { type ToolCategory } from 'twenty-shared/ai';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

// Invokes a tool from a factory-generated ToolSet by name. Used by providers
// whose tools are produced as opaque AI-SDK ToolSet closures (view, metadata,
// workflow, dashboard, view-field) and which therefore cannot dispatch by
// executionRef alone.
//
// The factory closures expect a `loadingMessage` field (added by the chat UX
// wrapper) and a ToolExecutionOptions object; neither is meaningful when the
// executor is invoking them internally, so we pass empty defaults.
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

  return tool.execute(
    { loadingMessage: '', ...args },
    { toolCallId: '', messages: [] },
  ) as Promise<ToolOutput>;
};
