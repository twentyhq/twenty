import { describe, expect, it } from 'vitest';

import { stripSlackBotMention } from 'src/logic-functions/utils/strip-slack-bot-mention';

const stripBotMention = (text: string): string =>
  stripSlackBotMention({ text, botUserId: 'UBOT' });

describe('stripSlackBotMention', () => {
  it('should drop a leading bot mention', () => {
    expect(stripBotMention('<@UBOT> list open deals')).toBe('list open deals');
  });

  it('should replace a mid-text bot mention with you', () => {
    expect(stripBotMention('can <@UBOT> list open deals?')).toBe(
      'can you list open deals?',
    );
  });

  it('should drop the leading mention and replace the mid-text one', () => {
    expect(stripBotMention('<@UBOT> can <@UBOT> list open deals?')).toBe(
      'can you list open deals?',
    );
  });

  it('should replace the labelled mention form', () => {
    expect(stripBotMention('ask <@UBOT|twenty> about ACME')).toBe(
      'ask you about ACME',
    );
  });

  it('should keep the punctuation tight around the replacement', () => {
    expect(stripBotMention('hey <@UBOT>, who owns ACME?')).toBe(
      'hey you, who owns ACME?',
    );
  });

  it('should drop the punctuation left behind by a leading mention', () => {
    expect(stripBotMention('<@UBOT>, who owns ACME?')).toBe('who owns ACME?');
  });

  it('should collapse consecutive mentions into a single replacement', () => {
    expect(stripBotMention('hey <@UBOT> <@UBOT>, who owns ACME?')).toBe(
      'hey you, who owns ACME?',
    );
  });

  it('should keep word boundaries around a mention glued to text', () => {
    expect(stripBotMention('please<@UBOT>review the ACME deal')).toBe(
      'please you review the ACME deal',
    );
  });

  it('should keep other user mentions', () => {
    expect(stripBotMention('<@UBOT> ask <@UALICE> about ACME')).toBe(
      'ask <@UALICE> about ACME',
    );
  });

  it('should not touch a mention whose id merely starts with the bot id', () => {
    expect(stripBotMention('ping <@UBOTHER> about ACME')).toBe(
      'ping <@UBOTHER> about ACME',
    );
  });

  it('should return the text unchanged for a malformed bot id', () => {
    expect(
      stripSlackBotMention({ text: 'hey <@UBOT> there', botUserId: 'U+.*' }),
    ).toBe('hey <@UBOT> there');
  });
});
