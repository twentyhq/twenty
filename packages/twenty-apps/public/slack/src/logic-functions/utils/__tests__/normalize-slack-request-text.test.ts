import { describe, expect, it } from 'vitest';

import { normalizeSlackRequestText } from 'src/logic-functions/utils/normalize-slack-request-text';

const BOT_USER_ID = 'U0BOT';

describe('normalizeSlackRequestText', () => {
  it('should strip the leading bot mention and collapse whitespace', () => {
    expect(
      normalizeSlackRequestText({
        text: `<@${BOT_USER_ID}>   who   owns\n\nACME? `,
        botUserId: BOT_USER_ID,
      }),
    ).toBe('who owns ACME?');
  });

  it('should read a mentioned and an already stripped message the same way', () => {
    const mentioned = normalizeSlackRequestText({
      text: `<@${BOT_USER_ID}> who owns ACME?`,
      botUserId: BOT_USER_ID,
    });

    expect(
      normalizeSlackRequestText({
        text: 'who owns ACME?',
        botUserId: BOT_USER_ID,
      }),
    ).toBe(mentioned);
  });

  it('should keep the mention when the bot id is unknown', () => {
    expect(
      normalizeSlackRequestText({
        text: `<@${BOT_USER_ID}> who owns ACME?`,
        botUserId: undefined,
      }),
    ).toBe(`<@${BOT_USER_ID}> who owns ACME?`);
  });

  it('should keep mentions of other users untouched', () => {
    expect(
      normalizeSlackRequestText({
        text: `<@${BOT_USER_ID}> what is <@U0OTHER> working on?`,
        botUserId: BOT_USER_ID,
      }),
    ).toBe('what is <@U0OTHER> working on?');
  });
});
