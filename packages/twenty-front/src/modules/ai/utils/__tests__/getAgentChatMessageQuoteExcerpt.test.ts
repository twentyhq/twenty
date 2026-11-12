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

  it('keeps a blockquote that is not a reply quote', () => {
    expect(
      getAgentChatMessageQuoteExcerpt({
        parts: [
          {
            type: 'text',
            text: '> Stripe renews on Friday.\n\nI drafted the follow-up.',
          },
        ],
      }),
    ).toBe('> Stripe renews on Friday.\n\nI drafted the follow-up.');
  });

  it('keeps the text an assistant wrote around its tool calls', () => {
    expect(
      getAgentChatMessageQuoteExcerpt({
        parts: [
          { type: 'reasoning', text: 'Looking for deals.' },
          { type: 'text', text: 'Let me check.' },
          {
            type: 'tool-find_opportunities',
            toolCallId: 'call-1',
            state: 'output-available',
            input: {},
            output: {},
          },
          { type: 'text', text: 'Five deals close this week.' },
        ],
      }),
    ).toBe('Let me check.\n\nFive deals close this week.');
  });
});
