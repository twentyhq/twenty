import { prependInboxQuoteToText } from '@/ai/utils/prependInboxQuoteToText';

describe('prependInboxQuoteToText', () => {
  it('quotes every line of the excerpt above the reply', () => {
    expect(
      prependInboxQuoteToText({
        text: 'I will take Stripe.',
        authorName: 'Marco Rossi',
        excerpt: 'Can you take Stripe?\nI will handle Google.',
      }),
    ).toBe(
      '> **Marco Rossi:** Can you take Stripe?\n> I will handle Google.\n\nI will take Stripe.',
    );
  });
});
