import { type ToolSet } from 'ai';
import { encode } from '@toon-format/toon';

// Wraps every tool's execute() so it returns a TOON-encoded string
// instead of a JSON object. Both the model and the frontend receive
// the same TOON output — the model benefits from fewer tokens, and
// the frontend can render it as formatted text.
export const wrapToolsWithToonOutput = (tools: ToolSet): ToolSet => {
  const wrappedTools: ToolSet = {};

  for (const [name, tool] of Object.entries(tools)) {
    if (!tool.execute) {
      wrappedTools[name] = tool;
      continue;
    }

    const originalExecute = tool.execute;

    wrappedTools[name] = {
      ...tool,
      execute: async (...args: Parameters<typeof originalExecute>) => {
        const result = await originalExecute(...args);

        return encode(result);
      },
    };
  }

  return wrappedTools;
};
