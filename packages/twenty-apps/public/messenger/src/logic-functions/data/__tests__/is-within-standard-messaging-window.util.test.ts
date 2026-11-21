import { describe, expect, it } from 'vitest';

import { isWithinStandardMessagingWindow } from 'src/logic-functions/data/is-within-standard-messaging-window.util';

const NOW = new Date('2026-11-21T12:00:00Z');
const HOUR_MS = 60 * 60 * 1000;

describe('isWithinStandardMessagingWindow', () => {
  it('allows a reply 23 hours after the last customer message', () => {
    expect(
      isWithinStandardMessagingWindow({
        lastCustomerMessageAt: new Date(NOW.getTime() - 23 * HOUR_MS),
        now: NOW,
      }),
    ).toBe(true);
  });

  it('refuses a reply exactly 24 hours later', () => {
    expect(
      isWithinStandardMessagingWindow({
        lastCustomerMessageAt: new Date(NOW.getTime() - 24 * HOUR_MS),
        now: NOW,
      }),
    ).toBe(false);
  });

  it('refuses a reply when the customer never wrote', () => {
    expect(
      isWithinStandardMessagingWindow({ lastCustomerMessageAt: undefined, now: NOW }),
    ).toBe(false);
  });
});
