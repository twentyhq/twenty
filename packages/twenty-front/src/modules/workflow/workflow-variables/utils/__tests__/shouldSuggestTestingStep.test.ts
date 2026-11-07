import { shouldSuggestTestingStep } from '@/workflow/workflow-variables/utils/shouldSuggestTestingStep';

describe('shouldSuggestTestingStep', () => {
  it('suggests testing an untested code or logic function step', () => {
    expect(
      shouldSuggestTestingStep({
        step: { type: 'CODE', outputSchema: {} },
        currentPath: [],
      }),
    ).toBe(true);
    expect(
      shouldSuggestTestingStep({
        step: { type: 'LOGIC_FUNCTION', outputSchema: {} },
        currentPath: [],
      }),
    ).toBe(true);
  });

  it('does not suggest testing a step that has outputs', () => {
    expect(
      shouldSuggestTestingStep({
        step: {
          type: 'CODE',
          outputSchema: {
            prefix: {
              isLeaf: true,
              type: 'string',
              label: 'Prefix',
              value: 'A',
            },
          },
        },
        currentPath: [],
      }),
    ).toBe(false);
  });

  it('does not suggest testing a step type without a Test tab', () => {
    expect(
      shouldSuggestTestingStep({
        step: { type: 'HTTP_REQUEST', outputSchema: {} },
        currentPath: [],
      }),
    ).toBe(false);
  });

  it('does not suggest testing inside a nested path', () => {
    expect(
      shouldSuggestTestingStep({
        step: { type: 'CODE', outputSchema: {} },
        currentPath: ['data'],
      }),
    ).toBe(false);
  });
});
