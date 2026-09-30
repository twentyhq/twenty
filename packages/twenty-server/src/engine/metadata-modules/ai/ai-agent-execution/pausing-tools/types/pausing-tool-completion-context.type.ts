import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

// Tools run as the person who answered, with their permissions, never as the
// agent that asked.
export type PausingToolCompletionContext = {
  executeTool: (args: {
    toolName: string;
    args: Record<string, unknown>;
  }) => Promise<ToolOutput>;
};
