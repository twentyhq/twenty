import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';
import { type PausingToolDefinition } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-definition.type';

export const definePausingTool = <
  TInput,
  TOutput extends Record<string, unknown>,
>(
  definition: PausingToolDefinition<TInput, TOutput>,
): PausingTool => ({
  isAwaitingOutput: definition.isAwaitingOutput,
  parseCall: (toolInput) => {
    const parsedInput = definition.inputSchema.safeParse(toolInput);

    if (!parsedInput.success) {
      return null;
    }

    const input = parsedInput.data;

    return {
      buildAsk: () => definition.buildAsk(input),
      toSkippedToolResult: () => definition.toSkippedToolResult(input),
      resolve: (output) => {
        const parsedOutput = definition.outputSchema(input).safeParse(output);

        if (!parsedOutput.success) {
          return {
            isValid: false,
            errorMessage: parsedOutput.error.issues
              .map((issue) => issue.message)
              .join(' '),
          };
        }

        return {
          isValid: true,
          output: parsedOutput.data,
          toolResult: definition.toToolResult(parsedOutput.data, input),
          answerText: definition.toAnswerText(parsedOutput.data, input),
        };
      },
    };
  },
});
