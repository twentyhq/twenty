import { z } from 'zod';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

export const buildInvalidToolArgumentsOutput = ({
  toolName,
  error,
}: {
  toolName: string;
  error: Error;
}): ToolOutput => ({
  success: false,
  message: `Invalid arguments for ${toolName}`,
  error: `The arguments do not match the input schema of ${toolName}: ${
    error instanceof z.ZodError ? z.prettifyError(error) : error.message
  }`,
});
