import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';

// Not the SDK's hasToolCall: its stop condition may return a promise, and this
// check is also read synchronously once the run returns, to report the pause.
// A call the SDK rejected as invalid never presented anything, so the model
// gets its validation error back and another step instead of a silent pause.
export const endsOnPausingToolCall = ({
  steps,
  offeredToolNames,
}: {
  steps: { toolCalls: { toolName: string; invalid?: boolean }[] }[];
  // Narrows the pause to the pausing tools a run was actually given.
  offeredToolNames?: string[];
}): boolean =>
  steps[steps.length - 1]?.toolCalls.some(
    (toolCall) =>
      toolCall.invalid !== true &&
      PAUSING_TOOLS.has(toolCall.toolName) &&
      (offeredToolNames?.includes(toolCall.toolName) ?? true),
  ) ?? false;
