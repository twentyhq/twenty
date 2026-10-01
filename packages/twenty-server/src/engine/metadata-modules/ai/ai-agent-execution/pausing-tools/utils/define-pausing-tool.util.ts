import { isPlainObject } from 'twenty-shared/utils';

import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';
import { type PausingToolDefinition } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-definition.type';

export const definePausingTool = <
  TInput,
  TOutput extends Record<string, unknown>,
>(
  definition: PausingToolDefinition<TInput, TOutput>,
): PausingTool => ({
  isAwaitingOutput: (toolOutput) =>
    isPlainObject(toolOutput) &&
    isPlainObject(toolOutput.result) &&
    toolOutput.result.status === 'pending',
  parseCall: (toolInput) => {
    const parsedInput = definition.inputSchema.safeParse(toolInput);

    if (!parsedInput.success) {
      return null;
    }

    const input = parsedInput.data;
    const outputSchema = definition.outputSchema(input);

    return {
      toSkippedToolResult: () => definition.toSkippedToolResult(input),
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
          context,
        }),
    };
  },
});
