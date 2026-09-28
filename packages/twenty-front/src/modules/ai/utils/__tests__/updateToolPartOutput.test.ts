import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { updateToolPartOutput } from '@/ai/utils/updateToolPartOutput';

const messages = [
  {
    id: 'assistant-1',
    role: 'assistant',
    parts: [
      { type: 'text', text: 'Before asking' },
      {
        type: 'tool-ask_questions',
        toolCallId: 'call-1',
        state: 'output-available',
        input: { questions: [] },
        output: { result: { questions: [], status: 'pending' } },
      },
    ],
  },
  {
    id: 'assistant-2',
    role: 'assistant',
    parts: [{ type: 'text', text: 'Untouched' }],
  },
] as unknown as ExtendedUIMessage[];

describe('updateToolPartOutput', () => {
  it('replaces the output of the matching tool call only', () => {
    const answeredOutput = { result: { questions: [], status: 'answered' } };

    const result = updateToolPartOutput({
      messages,
      toolCallId: 'call-1',
      output: answeredOutput,
    });

    expect(result[0]?.parts[1]).toMatchObject({
      toolCallId: 'call-1',
      output: answeredOutput,
    });
    expect(result[0]?.parts[0]).toBe(messages[0]?.parts[0]);
    expect(result[1]).toBe(messages[1]);
  });

  it('leaves the messages as they are for an unknown tool call', () => {
    expect(
      updateToolPartOutput({ messages, toolCallId: 'unknown', output: {} }),
    ).toEqual(messages);
  });
});
