import { describe, expect, it } from 'vitest';

import { stripSlackBotMention } from 'src/logic-functions/utils/strip-slack-bot-mention';

const stripAndCollapse = (text: string): string =>
  stripSlackBotMention({ text, botUserId: 'UBOT' })
    .replace(/\s+/g, ' ')
    .trim();

describe('stripSlackBotMention', () => {
  it('should strip the bot mention anywhere in the text', () => {
    expect(stripAndCollapse('<@UBOT> can <@UBOT> list open deals?')).toBe(
      'can list open deals?',
    );
  });

  it('should strip the labelled mention form', () => {
    expect(stripAndCollapse('ask <@UBOT|twenty> about ACME')).toBe(
      'ask about ACME',
    );
  });

  it('should not leave a space before punctuation that follows the mention', () => {
    expect(
      stripSlackBotMention({
        text: 'hey <@UBOT>, who owns ACME?',
        botUserId: 'UBOT',
      }),
    ).toBe('hey, who owns ACME?');
  });

  it('should handle consecutive mentions before punctuation', () => {
    expect(
      stripSlackBotMention({
        text: 'hey <@UBOT> <@UBOT>, who owns ACME?',
        botUserId: 'UBOT',
      }),
    ).toBe('hey, who owns ACME?');
  });

  it('should keep other user mentions', () => {
    expect(stripAndCollapse('<@UBOT> ask <@UALICE> about ACME')).toBe(
      'ask <@UALICE> about ACME',
    );
  });

  it('should not strip a mention whose id merely starts with the bot id', () => {
    expect(stripAndCollapse('ping <@UBOTHER> about ACME')).toBe(
      'ping <@UBOTHER> about ACME',
    );
  });

  it('should return the text unchanged for a malformed bot id', () => {
    expect(
      stripSlackBotMention({ text: 'hey <@UBOT> there', botUserId: 'U+.*' }),
    ).toBe('hey <@UBOT> there');
  });
});
