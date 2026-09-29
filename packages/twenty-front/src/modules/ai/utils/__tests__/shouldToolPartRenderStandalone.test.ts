import { type ToolUIPart } from 'ai';

import { type ToolWidget } from '@/ai/types/ToolWidget';
import { shouldToolPartRenderStandalone } from '@/ai/utils/shouldToolPartRenderStandalone';

const buildToolPart = (state: string): ToolUIPart =>
  ({
    type: 'tool-find_many_companies',
    toolCallId: 'call_1',
    state,
    input: {},
  }) as unknown as ToolUIPart;

const BUILTIN_WIDGET: ToolWidget = { kind: 'builtin', name: 'records' };
const APP_WIDGET: ToolWidget = {
  kind: 'front-component',
  frontComponentId: '20202020-0000-4000-8000-000000000001',
};

describe('shouldToolPartRenderStandalone', () => {
  it('leaves a call with no widget in the step group', () => {
    expect(
      shouldToolPartRenderStandalone(
        buildToolPart('output-available'),
        undefined,
      ),
    ).toBe(false);
  });

  describe('a built-in widget', () => {
    it('renders once the call has produced output', () => {
      expect(
        shouldToolPartRenderStandalone(
          buildToolPart('output-available'),
          BUILTIN_WIDGET,
        ),
      ).toBe(true);
    });

    it.each(['input-streaming', 'input-available', 'output-error'])(
      'has nothing to draw in the %s state',
      (state) => {
        expect(
          shouldToolPartRenderStandalone(buildToolPart(state), BUILTIN_WIDGET),
        ).toBe(false);
      },
    );
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
        shouldToolPartRenderStandalone(buildToolPart(state), APP_WIDGET),
      ).toBe(true);
    });

    it('waits for the input to settle before mounting', () => {
      expect(
        shouldToolPartRenderStandalone(
          buildToolPart('input-streaming'),
          APP_WIDGET,
        ),
      ).toBe(false);
    });
  });
});
