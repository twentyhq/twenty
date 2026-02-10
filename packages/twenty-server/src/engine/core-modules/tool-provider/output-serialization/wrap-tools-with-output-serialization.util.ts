import { type ToolSet } from 'ai';

import { compactToolOutput } from './compact-tool-output.util';

// Wraps every tool's execute function with output serialization.
// The wrapper intercepts the raw tool result and applies compaction
// (strip nulls/empty, flatten) before the AI SDK serializes it
// into the conversation context.
//
// This is a composable utility — it can be chained with other
// wrappers like wrapToolsWithErrorContext.
export const wrapToolsWithOutputSerialization = (tools: ToolSet): ToolSet => {
  const wrappedTools: ToolSet = {};

  for (const [toolName, tool] of Object.entries(tools)) {
    if (!tool.execute) {
      wrappedTools[toolName] = tool;
      continue;
    }

    const originalExecute = tool.execute;

    wrappedTools[toolName] = {
      ...tool,
      execute: async (...args: Parameters<typeof originalExecute>) => {
        const result = await originalExecute(...args);

        return compactToolOutput(result);
      },
    };
  }

  return wrappedTools;
};
