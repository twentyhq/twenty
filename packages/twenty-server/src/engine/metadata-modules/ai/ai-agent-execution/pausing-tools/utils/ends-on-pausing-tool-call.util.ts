import { isDefined } from 'twenty-shared/utils';

import { findAwaitingPausingTool } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/utils/find-awaiting-pausing-tool.util';

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
  steps[steps.length - 1]?.toolResults.some(
    ({ toolName, output }) =>
      (offeredToolNames?.includes(toolName) ?? true) &&
      isDefined(findAwaitingPausingTool({ toolName, toolOutput: output })),
  ) ?? false;
