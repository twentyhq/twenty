import { i18n } from '@lingui/core';

import { type ThinkingStepPart } from '@/ai/types/ThinkingStepPart';
import { type ToolDisplayContext } from '@/ai/types/ToolDisplayContext';
import { getThinkingStepLabel } from '@/ai/utils/getThinkingStepLabel';

const emptyDisplayContext: ToolDisplayContext = {
  labelByName: new Map(),
  indexByName: new Map(),
  objectMetadataItems: [],
};

const webSearchPart = {
  type: 'tool-web_search',
  toolCallId: 'tool-call-id',
  input: { query: 'CRM tools' },
  output: { results: [] },
  state: 'output-available',
} as ThinkingStepPart;

describe('getThinkingStepLabel', () => {
  beforeAll(() => {
    i18n.load('en', {});
    i18n.activate('en');
  });

  it('should use the latest reasoning title', () => {
    const label = getThinkingStepLabel({
      part: {
        type: 'reasoning',
        text: '**Planning**\nfirst\n**Searching records**\nsecond',
        state: 'done',
      } as ThinkingStepPart,
      isActive: false,
      displayContext: emptyDisplayContext,
    });

    expect(label).toBe('Searching records');
  });

  it('should fall back to a generic reasoning label', () => {
    const reasoningPart = {
      type: 'reasoning',
      text: 'no title',
      state: 'streaming',
    } as ThinkingStepPart;

    expect(
      getThinkingStepLabel({
        part: reasoningPart,
        isActive: true,
        displayContext: emptyDisplayContext,
      }),
    ).toBe('Thinking');
    expect(
      getThinkingStepLabel({
        part: reasoningPart,
        isActive: false,
        displayContext: emptyDisplayContext,
      }),
    ).toBe('Thought');
  });

  it('should describe a tool step as in progress while active', () => {
    const activeLabel = getThinkingStepLabel({
      part: webSearchPart,
      isActive: true,
      displayContext: emptyDisplayContext,
    });
    const finishedLabel = getThinkingStepLabel({
      part: webSearchPart,
      isActive: false,
      displayContext: emptyDisplayContext,
    });

    expect(activeLabel).toContain('CRM tools');
    expect(finishedLabel).toContain('Searched');
    expect(activeLabel).not.toBe(finishedLabel);
  });
});
