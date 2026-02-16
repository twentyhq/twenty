import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { getActiveReasoningContent } from '@/ai/utils/getActiveReasoningContent';
import { getLastReasoningContent } from '@/ai/utils/getLastReasoningContent';
import { groupContiguousThinkingStepParts } from '@/ai/utils/groupContiguousThinkingStepParts';
import { isThinkingStepPartActive } from '@/ai/utils/isThinkingStepPartActive';
import { type ThinkingStepPart } from '@/ai/utils/thinkingStepPart';

const createReasoningPart = ({
  state = 'done',
  text = 'Reasoning content',
}: {
  state?: string;
  text?: string;
} = {}): ThinkingStepPart =>
  ({
    type: 'reasoning',
    text,
    state,
  }) as ThinkingStepPart;

const createToolPart = ({
  errorText,
  input = {},
  output,
  type = 'tool-web_search',
}: {
  type?: `tool-${string}`;
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
} = {}): ThinkingStepPart =>
  ({
    type,
    toolCallId: 'tool-call-id',
    input,
    output,
    errorText,
    state: 'output-available',
  }) as ThinkingStepPart;

describe('thinkingStepsDisplayState', () => {
  describe('groupContiguousThinkingStepParts', () => {
    it('should group contiguous reasoning and non-code-interpreter tool parts', () => {
      const parts = [
        { type: 'text', text: 'hello' } as ExtendedUIMessagePart,
        { type: 'step-start' } as ExtendedUIMessagePart,
        createReasoningPart({ text: 'reasoning-1' }) as ExtendedUIMessagePart,
        createToolPart({
          type: 'tool-web_search',
          input: { query: 'crm software' },
        }) as ExtendedUIMessagePart,
        createToolPart({
          type: 'tool-create_task',
          output: { result: { id: 'task-1' } },
        }) as ExtendedUIMessagePart,
        { type: 'step-start' } as ExtendedUIMessagePart,
        { type: 'text', text: 'final answer' } as ExtendedUIMessagePart,
        createToolPart({
          type: 'tool-code_interpreter',
          output: { result: { stdout: 'done' } },
        }) as ExtendedUIMessagePart,
      ];

      const groupedParts = groupContiguousThinkingStepParts(parts);

      expect(groupedParts).toHaveLength(4);
      expect(groupedParts[0]).toEqual({
        type: 'part',
        part: parts[0],
      });
      expect(groupedParts[1]).toMatchObject({
        type: 'thinking-steps',
        parts: [parts[2], parts[3], parts[4]],
      });
      expect(groupedParts[2]).toEqual({
        type: 'part',
        part: parts[6],
      });
      expect(groupedParts[3]).toEqual({
        type: 'part',
        part: parts[7],
      });
    });
  });

  describe('isThinkingStepPartActive', () => {
    it('should mark streaming reasoning parts as active', () => {
      const reasoningPart = createReasoningPart({ state: 'streaming' });

      expect(isThinkingStepPartActive(reasoningPart, false)).toBe(true);
    });

    it('should mark tool parts without output as active while message is streaming', () => {
      const toolPart = createToolPart({
        type: 'tool-web_search',
        output: undefined,
        errorText: undefined,
      });

      expect(isThinkingStepPartActive(toolPart, true)).toBe(true);
      expect(isThinkingStepPartActive(toolPart, false)).toBe(false);
    });

    it('should mark tool parts with output or error as inactive', () => {
      const completedToolPart = createToolPart({
        output: { result: { ok: true } },
      });
      const failedToolPart = createToolPart({
        output: undefined,
        errorText: 'Tool failed',
      });

      expect(isThinkingStepPartActive(completedToolPart, true)).toBe(false);
      expect(isThinkingStepPartActive(failedToolPart, true)).toBe(false);
    });
  });

  describe('reasoning content helpers', () => {
    const parts = [
      createReasoningPart({ state: 'done', text: 'Initial reasoning' }),
      createToolPart({ type: 'tool-web_search' }),
      createReasoningPart({ state: 'streaming', text: 'Active reasoning' }),
    ];

    it('should return active reasoning content', () => {
      expect(getActiveReasoningContent(parts)).toBe('Active reasoning');
    });

    it('should return the latest reasoning content', () => {
      expect(getLastReasoningContent(parts)).toBe('Active reasoning');
    });
  });
});
