import { parseAiChatMessageQuote } from '@/ai/utils/parseAgentChatMessageQuote';
import { prependAiChatQuoteToText } from '@/ai/utils/prependAgentChatQuoteToText';

describe('parseAiChatMessageQuote', () => {
  it('reads back a quote written above a reply', () => {
    expect(
      parseAiChatMessageQuote(
        prependAiChatQuoteToText({
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
      parseAiChatMessageQuote(
        prependAiChatQuoteToText({
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
    expect(parseAiChatMessageQuote('Which deals close this week?')).toBe(null);
  });

  it('ignores a blockquote that does not name an author', () => {
    expect(parseAiChatMessageQuote('> Ship it on Friday.\n\nAgreed.')).toBe(
      null,
    );
  });

  it('ignores a quote with no reply below it', () => {
    expect(parseAiChatMessageQuote('> **Marco Rossi:** On it.')).toBe(null);
  });

  it('reads back a quote of a message without text', () => {
    expect(
      parseAiChatMessageQuote(
        prependAiChatQuoteToText({
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
