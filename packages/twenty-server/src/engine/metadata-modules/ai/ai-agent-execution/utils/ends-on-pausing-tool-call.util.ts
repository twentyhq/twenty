// Not the SDK's hasToolCall: its stop condition may return a promise, and this
// check is also read synchronously once the run returns, to report the pause.
export const endsOnPausingToolCall = ({
  steps,
  pausingToolNames,
}: {
  steps: { toolCalls: { toolName: string }[] }[];
  pausingToolNames: string[];
}): boolean =>
  steps[steps.length - 1]?.toolCalls.some((toolCall) =>
    pausingToolNames.includes(toolCall.toolName),
  ) ?? false;
