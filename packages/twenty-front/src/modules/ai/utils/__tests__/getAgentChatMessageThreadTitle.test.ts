import { type ExtendedUIMessage } from 'twenty-shared/ai';

import { getInboxMessageThreadTitle } from '@/ai/utils/getAgentChatMessageThreadTitle';

describe('getInboxMessageThreadTitle', () => {
  it('returns the title carried by a thread title data part', () => {
    const message: ExtendedUIMessage = {
      id: 'message',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'Hello' },
        { type: 'data-thread-title', data: { title: 'Quarterly review' } },
      ],
    };

    expect(getInboxMessageThreadTitle(message)).toBe('Quarterly review');
  });

  it('returns undefined when the message has no thread title part', () => {
    const message: ExtendedUIMessage = {
      id: 'message',
      role: 'assistant',
      parts: [{ type: 'text', text: 'Hello' }],
    };

    expect(getInboxMessageThreadTitle(message)).toBeUndefined();
  });
});
