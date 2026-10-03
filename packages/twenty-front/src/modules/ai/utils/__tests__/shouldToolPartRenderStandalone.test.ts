import { type ToolUIPart } from 'ai';

import { shouldToolPartRenderStandalone } from '@/ai/utils/shouldToolPartRenderStandalone';

const buildToolPart = (state: string): ToolUIPart =>
  ({
    type: 'tool-find_many_companies',
    toolCallId: 'call_1',
    state,
    input: {},
  }) as unknown as ToolUIPart;

const APP_FRONT_COMPONENT_ID = '20202020-0000-4000-8000-000000000001';

describe('shouldToolPartRenderStandalone', () => {
  it('leaves a call with no widget in the step group', () => {
    expect(
      shouldToolPartRenderStandalone(
        buildToolPart('output-available'),
        undefined,
      ),
    ).toBe(false);
  });

  describe('an app widget', () => {
    it.each([
      'input-available',
      'approval-requested',
      'approval-responded',
      'output-available',
      'output-denied',
      'output-error',
    ])('owns the call in the %s state', (state) => {
      expect(
        shouldToolPartRenderStandalone(
          buildToolPart(state),
          APP_FRONT_COMPONENT_ID,
        ),
      ).toBe(true);
    });

    it('waits for the input to settle before mounting', () => {
      expect(
        shouldToolPartRenderStandalone(
          buildToolPart('input-streaming'),
          APP_FRONT_COMPONENT_ID,
        ),
      ).toBe(false);
    });
  });
});
