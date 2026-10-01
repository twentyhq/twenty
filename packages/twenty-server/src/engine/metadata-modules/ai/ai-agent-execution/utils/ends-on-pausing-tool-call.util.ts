import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';

// not the SDK's hasToolCall, whose stop condition may be async: this is also read synchronously after the run
export const endsOnPausingToolCall = ({
  steps,
  offeredToolNames,
}: {
  steps: { toolCalls: { toolName: string }[] }[];
  offeredToolNames?: string[];
}): boolean =>
  steps[steps.length - 1]?.toolCalls.some(
    (toolCall) =>
      PAUSING_TOOLS.has(toolCall.toolName) &&
      (offeredToolNames?.includes(toolCall.toolName) ?? true),
  ) ?? false;
