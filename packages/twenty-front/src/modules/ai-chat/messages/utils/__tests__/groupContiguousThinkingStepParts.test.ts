import { type ExtendedUIMessagePart } from 'twenty-shared/ai';

import { groupContiguousThinkingStepParts } from '@/ai-chat/messages/utils/groupContiguousThinkingStepParts';
import { type ThinkingStepPart } from '@/ai-chat/thinking-steps/types/ThinkingStepPart';

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
  state = 'output-available',
  type = 'tool-web_search',
}: {
  type?: `tool-${string}`;
  input?: Record<string, unknown>;
  output?: unknown;
  errorText?: string;
  state?: string;
} = {}): ThinkingStepPart =>
  ({
    type,
    toolCallId: 'tool-call-id',
    input,
    output,
    errorText,
    state,
  }) as ThinkingStepPart;

describe('groupContiguousThinkingStepParts', () => {
  it('should group contiguous reasoning and tool parts', () => {
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
    expect(groupedParts[3]).toMatchObject({
      type: 'thinking-steps',
      parts: [parts[7]],
    });
  });
});
