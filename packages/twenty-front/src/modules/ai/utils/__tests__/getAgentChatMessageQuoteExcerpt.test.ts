import { AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH } from '@/ai/constants/AiChatQuoteExcerptMaxLength';
import { getAgentChatMessageQuoteExcerpt } from '@/ai/utils/getAgentChatMessageQuoteExcerpt';

describe('getAgentChatMessageQuoteExcerpt', () => {
  it('keeps a short message as is', () => {
    expect(
      getAgentChatMessageQuoteExcerpt({
        parts: [{ type: 'text', text: ' On it. ' }],
      }),
    ).toBe('On it.');
  });

  it('truncates a long message', () => {
    const excerpt = getAgentChatMessageQuoteExcerpt({
      parts: [
        {
          type: 'text',
          text: 'a'.repeat(AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH + 1),
        },
      ],
    });

    expect(excerpt).toBe(`${'a'.repeat(AI_CHAT_QUOTE_EXCERPT_MAX_LENGTH)}…`);
  });

  it('leaves out the quote a reply starts with', () => {
    expect(
      getAgentChatMessageQuoteExcerpt({
        parts: [
          {
            type: 'text',
            text: '> **Jane Doe:** Can you take Stripe?\n> They asked twice.\n\nYes, on it.',
          },
        ],
      }),
    ).toBe('Yes, on it.');
  });
});
