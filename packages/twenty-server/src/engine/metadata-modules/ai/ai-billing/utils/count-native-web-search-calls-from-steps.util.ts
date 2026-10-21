const WEB_SEARCH_TOOL_NAME = 'web_search';

export const countNativeWebSearchCallsFromSteps = (
  steps: { toolCalls: { toolName: string }[] }[],
): number =>
  steps.reduce(
    (count, step) =>
      count +
      step.toolCalls.filter(
        (toolCall) => toolCall.toolName === WEB_SEARCH_TOOL_NAME,
      ).length,
    0,
  );
