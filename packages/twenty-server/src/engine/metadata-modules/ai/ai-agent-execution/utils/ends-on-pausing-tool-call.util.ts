import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';

// not the SDK's hasToolCall, whose stop condition may be async: this is also read synchronously after the run
export const endsOnPausingToolCall = ({
  steps,
  offeredToolNames,
}: {
  steps: {
    toolCalls: { toolName: string; toolCallId: string }[];
    toolResults?: { toolCallId: string; output: unknown }[];
  }[];
  offeredToolNames?: string[];
}): boolean => {
  const lastStep = steps[steps.length - 1];

  return (
    lastStep?.toolCalls.some((toolCall) => {
      const pausingTool = PAUSING_TOOLS.get(toolCall.toolName);

      if (
        !isDefined(pausingTool) ||
        !(offeredToolNames?.includes(toolCall.toolName) ?? true)
      ) {
        return false;
      }

      const toolResult = lastStep.toolResults?.find(
        (result) => result.toolCallId === toolCall.toolCallId,
      );

      // a call refused when made returns its error to the model, which can correct it and go on
      return (
        !isDefined(toolResult) ||
        pausingTool.isAwaitingOutput(toolResult.output)
      );
    }) ?? false
  );
};
