import { isDefined } from 'twenty-shared/utils';

import { PAUSING_TOOLS } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/constants/pausing-tools.constant';

// not the SDK's hasToolCall, whose stop condition may be async: this is also read synchronously after the run
// a pausing call refused or failing when made has no awaiting result, so the model reads its error and goes on
export const endsOnPausingToolCall = ({
  steps,
  offeredToolNames,
}: {
  steps: {
    toolResults: { toolName: string; output: unknown }[];
  }[];
  offeredToolNames?: string[];
}): boolean =>
  steps[steps.length - 1]?.toolResults.some((toolResult) => {
    const pausingTool = PAUSING_TOOLS.get(toolResult.toolName);

    return (
      isDefined(pausingTool) &&
      (offeredToolNames?.includes(toolResult.toolName) ?? true) &&
      pausingTool.isAwaitingOutput(toolResult.output)
    );
  }) ?? false;
