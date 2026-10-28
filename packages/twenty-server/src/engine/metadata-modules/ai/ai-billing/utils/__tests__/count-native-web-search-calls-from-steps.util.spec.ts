import { countNativeWebSearchCallsFromSteps } from 'src/engine/metadata-modules/ai/ai-billing/utils/count-native-web-search-calls-from-steps.util';

const stepWithToolCalls = (...toolNames: string[]) => ({
  toolCalls: toolNames.map((toolName) => ({ toolName })),
});

describe('countNativeWebSearchCallsFromSteps', () => {
  it('counts web_search and x_search calls across steps', () => {
    expect(
      countNativeWebSearchCallsFromSteps([
        stepWithToolCalls('web_search', 'x_search'),
        stepWithToolCalls('x_search', 'x_search'),
      ]),
    ).toBe(4);
  });

  it('ignores tools that are not native provider tools', () => {
    expect(
      countNativeWebSearchCallsFromSteps([
        stepWithToolCalls('find_many_people', 'x_search'),
        stepWithToolCalls(),
      ]),
    ).toBe(1);
  });
});
