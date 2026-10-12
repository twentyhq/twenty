import { isDefined } from 'twenty-shared/utils';

import { findAwaitingPausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool.util';
import { isAwaitingPausingToolOutput } from 'src/engine/metadata-modules/ai/ai-history/utils/is-awaiting-pausing-tool-output.util';

// not the SDK's hasToolCall, whose stop condition may be async: this is also read synchronously after the run
// a pausing call refused or failing when made has no awaiting result, so the model reads its error and goes on
// an offered pausing tool may be resolved by something other than an answer, such as a wait
export const endsOnPausingToolCall = ({
  steps,
  offeredToolNames,
}: {
  steps: {
    toolResults: { toolName: string; output: unknown }[];
  }[];
  offeredToolNames?: string[];
}): boolean =>
  steps[steps.length - 1]?.toolResults.some(({ toolName, output }) =>
    isDefined(offeredToolNames)
      ? offeredToolNames.includes(toolName) &&
        isAwaitingPausingToolOutput(output)
      : isDefined(findAwaitingPausingTool({ toolName, toolOutput: output })),
  ) ?? false;
