import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/create-google-meet-event-subscription-or-throw.util';
import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';
import { ensureGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/ensure-google-meet-event-subscription-or-throw.util';
import { renewGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/renew-google-meet-event-subscription-or-throw.util';

vi.mock(
  'src/logic-functions/utils/create-google-meet-event-subscription-or-throw.util',
  () => ({ createGoogleMeetEventSubscriptionOrThrow: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/delete-google-meet-event-subscription.util',
  () => ({ deleteGoogleMeetEventSubscription: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/renew-google-meet-event-subscription-or-throw.util',
  () => ({ renewGoogleMeetEventSubscriptionOrThrow: vi.fn() }),
);

const PUBSUB_TOPIC = 'projects/twenty/topics/google-meet';

const SUBSCRIPTION_REQUEST = {
  accessToken: 'token',
  googleUserId: '1234567890',
  pubsubTopic: PUBSUB_TOPIC,
};

const EXISTING_SUBSCRIPTION = {
  name: 'subscriptions/existing',
  notificationEndpoint: { pubsubTopic: PUBSUB_TOPIC },
  eventTypes: [
    'google.workspace.meet.transcript.v2.fileGenerated',
    'google.workspace.meet.smartNote.v2.fileGenerated',
    'google.workspace.meet.recording.v2.fileGenerated',
  ],
};

const CREATED_SUBSCRIPTION = { name: 'subscriptions/created' };

describe('ensureGoogleMeetEventSubscriptionOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createGoogleMeetEventSubscriptionOrThrow).mockResolvedValue(
      CREATED_SUBSCRIPTION,
    );
    vi.mocked(renewGoogleMeetEventSubscriptionOrThrow).mockResolvedValue(
      EXISTING_SUBSCRIPTION,
    );
  });

  it('should create a subscription for a Google account that has none', async () => {
    await expect(
      ensureGoogleMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: undefined,
      }),
    ).resolves.toEqual(CREATED_SUBSCRIPTION);

    expect(
      createGoogleMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith(SUBSCRIPTION_REQUEST);
    expect(renewGoogleMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
    expect(deleteGoogleMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should renew a subscription that publishes to the configured topic', async () => {
    await expect(
      ensureGoogleMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: EXISTING_SUBSCRIPTION,
      }),
    ).resolves.toEqual(EXISTING_SUBSCRIPTION);

    expect(
      renewGoogleMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/existing',
    });
    expect(createGoogleMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
    expect(deleteGoogleMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should replace a subscription that Google suspended', async () => {
    await expect(
      ensureGoogleMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: { ...EXISTING_SUBSCRIPTION, state: 'SUSPENDED' },
      }),
    ).resolves.toEqual(CREATED_SUBSCRIPTION);

    expect(deleteGoogleMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/existing',
    });
    expect(
      createGoogleMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith(SUBSCRIPTION_REQUEST);
    expect(renewGoogleMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
  });

  it('should replace a subscription that publishes to another topic', async () => {
    await expect(
      ensureGoogleMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: {
          name: 'subscriptions/existing',
          notificationEndpoint: {
            pubsubTopic: 'projects/twenty/topics/previous',
          },
        },
      }),
    ).resolves.toEqual(CREATED_SUBSCRIPTION);

    expect(deleteGoogleMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/existing',
    });
    expect(
      createGoogleMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith(SUBSCRIPTION_REQUEST);
    expect(renewGoogleMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
  });
});
