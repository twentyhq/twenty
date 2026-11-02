import { type ToolUIPart } from 'ai';
import { PREVIEW_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';

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
  it('keeps a preview in the step group until its input is available', () => {
    const part: ToolUIPart = {
      type: `tool-${PREVIEW_FRONT_COMPONENT_TOOL_NAME}`,
      toolCallId: 'preview-call',
      state: 'input-streaming',
      input: {},
    };
    expect(
      shouldToolPartRenderStandalone({
        toolPart: part,
        isFrontComponentPreviewEnabled: true,
      }),
    ).toBe(false);
    expect(
      shouldToolPartRenderStandalone({
        toolPart: { ...part, state: 'input-available', input: {} },
        isFrontComponentPreviewEnabled: true,
      }),
    ).toBe(true);
  });

  it('leaves a call with no widget in the step group', () => {
    expect(
      shouldToolPartRenderStandalone({
        toolPart: buildToolPart('output-available'),
      }),
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
        shouldToolPartRenderStandalone({
          toolPart: buildToolPart(state),
          frontComponentId: APP_FRONT_COMPONENT_ID,
        }),
      ).toBe(true);
    });

    it('waits for the input to settle before mounting', () => {
      expect(
        shouldToolPartRenderStandalone({
          toolPart: buildToolPart('input-streaming'),
          frontComponentId: APP_FRONT_COMPONENT_ID,
        }),
      ).toBe(false);
    });
  });
});
