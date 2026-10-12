import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

// tools run with the answering person's permissions, never the agent's
export type PausingToolCompletionContext = {
  executeTool: (args: {
    toolName: string;
    args: Record<string, unknown>;
  }) => Promise<ToolOutput>;
};
