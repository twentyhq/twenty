import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { getAiChatMessageThreadTitle } from '@/ai/utils/getAiChatMessageThreadTitle';

describe('getAiChatMessageThreadTitle', () => {
  it('returns the title carried by a thread title data part', () => {
    const message: ExtendedUIMessage = {
      id: 'message',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'Hello' },
        { type: 'data-thread-title', data: { title: 'Quarterly review' } },
      ],
    };

    expect(getAiChatMessageThreadTitle(message)).toBe('Quarterly review');
  });

  it('returns undefined when the message has no thread title part', () => {
    const message: ExtendedUIMessage = {
      id: 'message',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello' }],
    };

    expect(getAiChatMessageThreadTitle(message)).toBeUndefined();
  });
});
