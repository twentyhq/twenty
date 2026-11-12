import { getAgentChatMessageQuoteSource } from '@/ai/utils/getAgentChatMessageQuoteSource';

const ASSISTANT_AUTHOR = {
  type: 'builtInAssistant' as const,
  name: 'Ada',
  isNameResolved: true,
};

describe('getAgentChatMessageQuoteSource', () => {
  it('keeps what the author said without the quote it answers', () => {
    expect(
      getAgentChatMessageQuoteSource({
        message: {
          id: 'message-id',
          parts: [
            {
              type: 'text',
              text: '> **Marco Rossi:** Can you take Stripe?\n\nOn it.',
            },
          ],
        },
        author: ASSISTANT_AUTHOR,
      }),
    ).toEqual({
      messageId: 'message-id',
      author: ASSISTANT_AUTHOR,
      excerpt: 'On it.',
    });
  });

  it('quotes a message without text with an empty excerpt', () => {
    expect(
      getAgentChatMessageQuoteSource({
        message: {
          id: 'message-id',
          parts: [
            {
              type: 'tool-find_companies',
              toolCallId: 'call-1',
              state: 'output-available',
              input: {},
              output: {},
            },
          ],
        },
        author: ASSISTANT_AUTHOR,
      }).excerpt,
    ).toBe('');
  });
});
