import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/create-meet-event-subscription-or-throw.util';
import { deleteMeetEventSubscription } from 'src/logic-functions/utils/delete-meet-event-subscription.util';
import { ensureMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/ensure-meet-event-subscription-or-throw.util';
import { renewMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/renew-meet-event-subscription-or-throw.util';

vi.mock(
  'src/logic-functions/utils/create-meet-event-subscription-or-throw.util',
  () => ({ createMeetEventSubscriptionOrThrow: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/delete-meet-event-subscription.util',
  () => ({ deleteMeetEventSubscription: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/renew-meet-event-subscription-or-throw.util',
  () => ({ renewMeetEventSubscriptionOrThrow: vi.fn() }),
);

const PUBSUB_TOPIC = 'projects/twenty/topics/meet';

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

describe('ensureMeetEventSubscriptionOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createMeetEventSubscriptionOrThrow).mockResolvedValue(
      CREATED_SUBSCRIPTION,
    );
    vi.mocked(renewMeetEventSubscriptionOrThrow).mockResolvedValue(
      EXISTING_SUBSCRIPTION,
    );
  });

  it('should create a subscription for a Google account that has none', async () => {
    await expect(
      ensureMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: undefined,
      }),
    ).resolves.toEqual(CREATED_SUBSCRIPTION);

    expect(
      createMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith(SUBSCRIPTION_REQUEST);
    expect(renewMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
    expect(deleteMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should renew a subscription that publishes to the configured topic', async () => {
    await expect(
      ensureMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: EXISTING_SUBSCRIPTION,
      }),
    ).resolves.toEqual(EXISTING_SUBSCRIPTION);

    expect(
      renewMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/existing',
    });
    expect(createMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
    expect(deleteMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should replace a subscription that Google suspended', async () => {
    await expect(
      ensureMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: { ...EXISTING_SUBSCRIPTION, state: 'SUSPENDED' },
      }),
    ).resolves.toEqual(CREATED_SUBSCRIPTION);

    expect(deleteMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/existing',
    });
    expect(
      createMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith(SUBSCRIPTION_REQUEST);
    expect(renewMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
  });

  it('should replace a subscription that publishes to another topic', async () => {
    await expect(
      ensureMeetEventSubscriptionOrThrow({
        ...SUBSCRIPTION_REQUEST,
        existingSubscription: {
          name: 'subscriptions/existing',
          notificationEndpoint: {
            pubsubTopic: 'projects/twenty/topics/previous',
          },
        },
      }),
    ).resolves.toEqual(CREATED_SUBSCRIPTION);

    expect(deleteMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      subscriptionName: 'subscriptions/existing',
    });
    expect(
      createMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith(SUBSCRIPTION_REQUEST);
    expect(renewMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
  });
});
