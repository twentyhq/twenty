import { isDefined } from 'twenty-shared/utils';

import { type PausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool.type';
import { type PausingToolDefinition } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/pausing-tool-definition.type';

export const definePausingTool = <
  TInput,
  TOutput extends Record<string, unknown>,
>(
  definition: PausingToolDefinition<TInput, TOutput>,
): PausingTool => {
  const {
    description,
    inputSchema,
    recordedInputSchema = inputSchema,
  } = definition;

  const prepareCall: PausingTool['prepareCall'] = async (
    toolInput,
    context = {},
  ) => {
    const parsedInput = inputSchema.safeParse(toolInput);

    if (!parsedInput.success) {
      return { error: parsedInput.error.message };
    }

    const preparation = await definition.prepare(parsedInput.data, context);

    if ('error' in preparation) {
      return preparation;
    }

    return {
      input: parsedInput.data,
      pendingOutput: {
        success: true,
        message: 'Shown to the user; awaiting their answer.',
        result: { ...preparation.pendingResult, status: 'pending' },
      },
    };
  };

  return {
    prepareCall,
    buildTool: (context) => ({
      description,
      inputSchema,
      execute: async (toolInput: TInput) => {
        const preparedCall = await prepareCall(toolInput, context);

        return 'error' in preparedCall
          ? {
              success: false,
              message: 'The call could not be made',
              error: preparedCall.error,
            }
          : preparedCall.pendingOutput;
      },
    }),
    parseCall: (toolInput, pendingToolOutput) => {
      const parsedInput = recordedInputSchema.safeParse(toolInput);

      if (!parsedInput.success) {
        return null;
      }

      const input = parsedInput.data;
      const outputSchema = definition.outputSchema(input, pendingToolOutput);

      const { toRunningToolResult, toInterruptedToolResult } = definition;

      return {
        preview: () => definition.preview(input, pendingToolOutput),
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
  };
};
