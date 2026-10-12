import { describe, expect, it } from 'vitest';

import { parseTeamsTranscriptSubscriptionNotifications } from 'src/features/transcripts/logic-functions/utils/parse-teams-transcript-subscription-notifications';

const SUBSCRIPTION = {
  subscriptionId: '516220d0-0f88-46cc-ac39-02b687687526',
  clientState: 'q3N9Hk2xYqk7aWb0p1sTqgk4jXv8dLr2mZc6eFh5uIo',
};

const TRANSCRIPT_NOTIFICATION = {
  subscriptionId: SUBSCRIPTION.subscriptionId,
  clientState: SUBSCRIPTION.clientState,
  changeType: 'created',
  resource:
    "users/976f4b31-fd01-4e0b-9178-29cc40c14438/onlineMeetings('MSo1')/transcripts('MSM1')",
};

const REAUTHORIZATION_NOTIFICATION = {
  subscriptionId: SUBSCRIPTION.subscriptionId,
  clientState: SUBSCRIPTION.clientState,
  lifecycleEvent: 'reauthorizationRequired',
};

describe('parseTeamsTranscriptSubscriptionNotifications', () => {
  it('should return every notification when all of them carry the subscription credentials', () => {
    expect(
      parseTeamsTranscriptSubscriptionNotifications({
        body: {
          value: [TRANSCRIPT_NOTIFICATION, REAUTHORIZATION_NOTIFICATION],
        },
        subscription: SUBSCRIPTION,
      }),
    ).toEqual([TRANSCRIPT_NOTIFICATION, REAUTHORIZATION_NOTIFICATION]);
  });

  it('should reject the whole delivery when one notification has another client state', () => {
    expect(
      parseTeamsTranscriptSubscriptionNotifications({
        body: {
          value: [
            TRANSCRIPT_NOTIFICATION,
            { ...REAUTHORIZATION_NOTIFICATION, clientState: 'forged' },
          ],
        },
        subscription: SUBSCRIPTION,
      }),
    ).toBeUndefined();
  });

  it('should reject a notification for another subscription or without a client state', () => {
    expect(
      parseTeamsTranscriptSubscriptionNotifications({
        body: {
          value: [{ ...TRANSCRIPT_NOTIFICATION, subscriptionId: 'other' }],
        },
        subscription: SUBSCRIPTION,
      }),
    ).toBeUndefined();
    expect(
      parseTeamsTranscriptSubscriptionNotifications({
        body: {
          value: [{ ...TRANSCRIPT_NOTIFICATION, clientState: undefined }],
        },
        subscription: SUBSCRIPTION,
      }),
    ).toBeUndefined();
  });

  it('should reject a body that is not a Graph notification collection', () => {
    expect(
      parseTeamsTranscriptSubscriptionNotifications({
        body: TRANSCRIPT_NOTIFICATION,
        subscription: SUBSCRIPTION,
      }),
    ).toBeUndefined();
    expect(
      parseTeamsTranscriptSubscriptionNotifications({
        body: { value: ['not a notification'] },
        subscription: SUBSCRIPTION,
      }),
    ).toBeUndefined();
  });
});
