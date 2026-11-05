import { type ToolUIPart } from 'ai';
import { PREVIEW_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';

import { shouldToolPartRenderStandalone } from '@/ai/utils/shouldToolPartRenderStandalone';

const BASE_TOOL_PART = {
  type: 'tool-find_many_companies',
  toolCallId: 'call_1',
  input: {},
} as const;

const TOOL_PART_BY_STATE: Record<ToolUIPart['state'], ToolUIPart> = {
  'input-streaming': { ...BASE_TOOL_PART, state: 'input-streaming' },
  'input-available': { ...BASE_TOOL_PART, state: 'input-available' },
  'approval-requested': {
    ...BASE_TOOL_PART,
    state: 'approval-requested',
    approval: { id: 'approval_1' },
  },
  'approval-responded': {
    ...BASE_TOOL_PART,
    state: 'approval-responded',
    approval: { id: 'approval_1', approved: true },
  },
  'output-available': {
    ...BASE_TOOL_PART,
    state: 'output-available',
    output: {},
  },
  'output-denied': {
    ...BASE_TOOL_PART,
    state: 'output-denied',
    approval: { id: 'approval_1', approved: false },
  },
  'output-error': {
    ...BASE_TOOL_PART,
    state: 'output-error',
    errorText: 'error',
  },
};

const buildToolPart = (state: ToolUIPart['state']) => TOOL_PART_BY_STATE[state];

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
    it.each<ToolUIPart['state']>([
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
