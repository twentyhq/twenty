import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const buildToolNotAvailableOutput = (toolName: string): ToolOutput => ({
  success: false,
  message: `Tool "${toolName}" is not available`,
  error: `Tool "${toolName}" is not available in this context.`,
});
