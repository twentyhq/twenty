import { describe, expect, it } from 'vitest';

import { getReplyMessagingType } from 'src/logic-functions/data/get-reply-messaging-type.util';

const NOW = new Date('2026-11-21T12:00:00Z');
const HOUR_MS = 60 * 60 * 1000;
const hoursAgo = (hours: number) => new Date(NOW.getTime() - hours * HOUR_MS);

describe('getReplyMessagingType', () => {
  it('sends a standard response within 24 hours', () => {
    expect(
      getReplyMessagingType({ lastCustomerMessageAt: hoursAgo(23), now: NOW }),
    ).toEqual({ messaging_type: 'RESPONSE' });
  });

  it('uses the human agent tag from 24 hours up to 7 days', () => {
    expect(
      getReplyMessagingType({ lastCustomerMessageAt: hoursAgo(24), now: NOW }),
    ).toEqual({ messaging_type: 'MESSAGE_TAG', tag: 'HUMAN_AGENT' });
    expect(
      getReplyMessagingType({ lastCustomerMessageAt: hoursAgo(167), now: NOW }),
    ).toEqual({ messaging_type: 'MESSAGE_TAG', tag: 'HUMAN_AGENT' });
  });

  it('refuses after 7 days or when the customer never wrote', () => {
    expect(
      getReplyMessagingType({ lastCustomerMessageAt: hoursAgo(168), now: NOW }),
    ).toBeUndefined();
    expect(
      getReplyMessagingType({ lastCustomerMessageAt: undefined, now: NOW }),
    ).toBeUndefined();
  });
});
