import { describe, expect, it } from 'vitest';

import { canRenewGoogleMeetEventSubscription } from 'src/logic-functions/utils/can-renew-google-meet-event-subscription.util';

const PUBSUB_TOPIC = 'projects/twenty/topics/google-meet';

const SUBSCRIPTION = {
  name: 'subscriptions/existing',
  state: 'ACTIVE' as const,
  notificationEndpoint: { pubsubTopic: PUBSUB_TOPIC },
  eventTypes: [
    'google.workspace.meet.transcript.v2.fileGenerated',
    'google.workspace.meet.smartNote.v2.fileGenerated',
    'google.workspace.meet.recording.v2.fileGenerated',
  ],
};

describe('canRenewGoogleMeetEventSubscription', () => {
  it('should renew an active subscription to the same topic and events', () => {
    expect(
      canRenewGoogleMeetEventSubscription({
        subscription: SUBSCRIPTION,
        pubsubTopic: PUBSUB_TOPIC,
      }),
    ).toBe(true);
  });

  it('should not renew a subscription that misses the Gemini notes event', () => {
    expect(
      canRenewGoogleMeetEventSubscription({
        subscription: {
          ...SUBSCRIPTION,
          eventTypes: ['google.workspace.meet.transcript.v2.fileGenerated'],
        },
        pubsubTopic: PUBSUB_TOPIC,
      }),
    ).toBe(false);
  });

  it('should not renew a subscription to another topic or a suspended one', () => {
    expect(
      canRenewGoogleMeetEventSubscription({
        subscription: SUBSCRIPTION,
        pubsubTopic: 'projects/twenty/topics/previous',
      }),
    ).toBe(false);
    expect(
      canRenewGoogleMeetEventSubscription({
        subscription: { ...SUBSCRIPTION, state: 'SUSPENDED' },
        pubsubTopic: PUBSUB_TOPIC,
      }),
    ).toBe(false);
  });
});
