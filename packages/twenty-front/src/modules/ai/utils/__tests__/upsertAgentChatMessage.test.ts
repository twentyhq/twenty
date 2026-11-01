import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { upsertAgentChatMessage } from '@/ai/utils/upsertAgentChatMessage';

const buildMessage = (id: string, text: string): ExtendedUIMessage => ({
  id,
  role: 'assistant',
  parts: [{ type: 'text', text }],
});

describe('upsertAgentChatMessage', () => {
  it('appends a message that is not in the list yet', () => {
    const first = buildMessage('first', 'Hello');
    const second = buildMessage('second', 'World');

    expect(upsertAgentChatMessage([first], second)).toEqual([first, second]);
  });

  it('replaces the message with the same id in place without mutating the list', () => {
    const messages = [
      buildMessage('first', 'Hello'),
      buildMessage('streaming', 'Wor'),
      buildMessage('last', '!'),
    ];
    const updatedStreamingMessage = buildMessage('streaming', 'World');

    const result = upsertAgentChatMessage(messages, updatedStreamingMessage);

    expect(result).toEqual([messages[0], updatedStreamingMessage, messages[2]]);
    expect(result).not.toBe(messages);
    expect(messages[1].parts).toEqual([{ type: 'text', text: 'Wor' }]);
  });
});
