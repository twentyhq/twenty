import { type StepResult, type ToolSet } from 'ai';

const WEB_SEARCH_TOOL_NAME = 'web_search';

export const countNativeWebSearchCallsFromSteps = (
  steps: StepResult<ToolSet>[],
): number =>
  steps.reduce(
    (count, step) =>
      count +
      step.toolCalls.filter(
        (toolCall) => toolCall.toolName === WEB_SEARCH_TOOL_NAME,
      ).length,
    0,
  );
