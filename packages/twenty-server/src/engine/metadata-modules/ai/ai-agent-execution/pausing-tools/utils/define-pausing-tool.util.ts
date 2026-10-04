import { isDefined } from 'twenty-shared/utils';

import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';
import { type PausingToolDefinition } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-definition.type';

export const definePausingTool = <
  TInput,
  TOutput extends Record<string, unknown>,
>(
  definition: PausingToolDefinition<TInput, TOutput>,
): PausingTool => ({
  parseCall: (toolInput, pendingToolOutput) => {
    const parsedInput = definition.inputSchema.safeParse(toolInput);

    if (!parsedInput.success) {
      return null;
    }

    const input = parsedInput.data;
    const outputSchema = definition.outputSchema(input, pendingToolOutput);

    const { toRunningToolResult, toInterruptedToolResult } = definition;

    return {
      toSkippedToolResult: () =>
        definition.toSkippedToolResult(input, pendingToolOutput),
      ...(isDefined(toRunningToolResult)
        ? {
            toRunningToolResult: (output: Record<string, unknown>) =>
              toRunningToolResult({
                output: outputSchema.parse(output),
                input,
                pendingToolOutput,
              }),
          }
        : {}),
      ...(isDefined(toInterruptedToolResult)
        ? {
            toInterruptedToolResult: () =>
              toInterruptedToolResult(input, pendingToolOutput),
          }
        : {}),
      validate: (output) => {
        const parsedOutput = outputSchema.safeParse(output);

        return parsedOutput.success
          ? { isValid: true, output: parsedOutput.data }
          : {
              isValid: false,
              errorMessage: parsedOutput.error.issues
                .map((issue) => issue.message)
                .join(' '),
            };
      },
      complete: ({ output, context }) =>
        definition.complete({
          output: outputSchema.parse(output),
          input,
          pendingToolOutput,
          context,
        }),
    };
  },
});
