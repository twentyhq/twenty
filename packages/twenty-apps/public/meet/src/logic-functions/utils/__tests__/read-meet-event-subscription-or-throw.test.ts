import { describe, expect, it } from 'vitest';

import { readMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/read-meet-event-subscription-or-throw.util';

describe('readMeetEventSubscriptionOrThrow', () => {
  it('should return the subscription of a finished operation', () => {
    const subscription = {
      name: 'subscriptions/first',
      expireTime: '2026-11-24T09:00:00Z',
    };

    expect(
      readMeetEventSubscriptionOrThrow({
        response: subscription,
      }),
    ).toEqual(subscription);
  });

  it('should report the error of a failed operation', () => {
    expect(() =>
      readMeetEventSubscriptionOrThrow({
        error: { message: 'Topic not found', status: 'NOT_FOUND' },
      }),
    ).toThrow(
      expect.objectContaining({
        message:
          'Google did not return the event subscription: Topic not found',
        code: 'EVENT_SUBSCRIPTION_FAILED',
        googleStatus: 'NOT_FOUND',
      }),
    );
  });

  it('should fail when the operation has no subscription', () => {
    expect(() => readMeetEventSubscriptionOrThrow({})).toThrow(
      expect.objectContaining({ code: 'EVENT_SUBSCRIPTION_FAILED' }),
    );
  });
});
