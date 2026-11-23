import { type ToolUIPart } from 'ai';
import { PREVIEW_FRONT_COMPONENT_TOOL_NAME } from 'twenty-shared/ai';

import { shouldToolPartRenderStandalone } from '@/ai-chat/tool-calls/utils/shouldToolPartRenderStandalone';

const BASE_TOOL_PART = {
  type: 'tool-find_many_companies',
  toolCallId: 'call_1',
  input: {},
} as const;

const TOOL_PART_BY_STATE = {
  'input-streaming': { ...BASE_TOOL_PART, state: 'input-streaming' },
  'input-available': { ...BASE_TOOL_PART, state: 'input-available' },
  'output-available': {
    ...BASE_TOOL_PART,
    state: 'output-available',
    output: {},
  },
} satisfies Partial<Record<ToolUIPart['state'], ToolUIPart>>;

const buildToolPart = (state: keyof typeof TOOL_PART_BY_STATE): ToolUIPart =>
  TOOL_PART_BY_STATE[state];

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
    it('owns the call once its input is available', () => {
      expect(
        shouldToolPartRenderStandalone({
          toolPart: buildToolPart('input-available'),
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
