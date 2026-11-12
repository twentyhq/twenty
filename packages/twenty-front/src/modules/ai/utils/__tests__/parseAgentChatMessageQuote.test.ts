import { parseAgentChatMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';
import { prependAgentChatQuoteToText } from '@/ai/utils/prependAgentChatQuoteToText';

describe('parseAgentChatMessageQuote', () => {
  it('reads back a quote written above a reply', () => {
    expect(
      parseAgentChatMessageQuote(
        prependAgentChatQuoteToText({
          text: 'I will take Stripe.',
          authorName: 'Marco Rossi',
          excerpt: 'Can you take Stripe?',
        }),
      ),
    ).toEqual({
      authorName: 'Marco Rossi',
      excerpt: 'Can you take Stripe?',
      replyText: 'I will take Stripe.',
    });
  });

  it('keeps every line of a multi-line excerpt', () => {
    expect(
      parseAgentChatMessageQuote(
        prependAgentChatQuoteToText({
          text: 'Done.\n\nBoth are handled.',
          authorName: 'Marco Rossi',
          excerpt: 'Can you take Stripe?\n\n> They asked twice.',
        }),
      ),
    ).toEqual({
      authorName: 'Marco Rossi',
      excerpt: 'Can you take Stripe?\n\n> They asked twice.',
      replyText: 'Done.\n\nBoth are handled.',
    });
  });

  it('ignores a message without a leading quote', () => {
    expect(parseAgentChatMessageQuote('Which deals close this week?')).toBe(
      null,
    );
  });

  it('ignores a blockquote that does not name an author', () => {
    expect(parseAgentChatMessageQuote('> Ship it on Friday.\n\nAgreed.')).toBe(
      null,
    );
  });

  it('ignores a quote with no reply below it', () => {
    expect(parseAgentChatMessageQuote('> **Marco Rossi:** On it.')).toBe(null);
  });

  it('reads back a quote of a message without text', () => {
    expect(
      parseAgentChatMessageQuote(
        prependAgentChatQuoteToText({
          text: 'Thanks for the update.',
          authorName: 'Ada',
          excerpt: '',
        }),
      ),
    ).toEqual({
      authorName: 'Ada',
      excerpt: '',
      replyText: 'Thanks for the update.',
    });
  });
});
