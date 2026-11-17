import { getConnection } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { googleMeetRegisterConnectionHandler } from 'src/logic-functions/google-meet-register-connection';
import { claimGoogleMeetEventSubscription } from 'src/logic-functions/utils/claim-google-meet-event-subscription.util';
import { ensureGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/ensure-google-meet-event-subscription-or-throw.util';
import { findGoogleMeetEventSubscription } from 'src/logic-functions/utils/find-google-meet-event-subscription.util';
import { storeGoogleMeetConnectionSubscription } from 'src/logic-functions/utils/store-google-meet-connection-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({ getConnection: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/find-google-meet-event-subscription.util',
  () => ({ findGoogleMeetEventSubscription: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/claim-google-meet-event-subscription.util',
  () => ({ claimGoogleMeetEventSubscription: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/ensure-google-meet-event-subscription-or-throw.util',
  () => ({ ensureGoogleMeetEventSubscriptionOrThrow: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/store-google-meet-connection-subscription.util',
  () => ({ storeGoogleMeetConnectionSubscription: vi.fn() }),
);

const PUBSUB_TOPIC = 'projects/twenty/topics/google-meet';
const SUBSCRIPTION = { name: 'subscriptions/first' };
const EXISTING_SUBSCRIPTION = { name: 'subscriptions/existing' };

describe('googleMeetRegisterConnectionHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GOOGLE_MEET_PUBSUB_TOPIC', PUBSUB_TOPIC);
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
      externalAccountId: '1234567890',
    });
    vi.mocked(findGoogleMeetEventSubscription).mockResolvedValue(undefined);
    vi.mocked(ensureGoogleMeetEventSubscriptionOrThrow).mockResolvedValue(
      SUBSCRIPTION,
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should subscribe to the events of the connected Google account', async () => {
    await expect(
      googleMeetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({
      success: true,
      subscriptionName: 'subscriptions/first',
    });

    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(findGoogleMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      googleUserId: '1234567890',
    });
    expect(claimGoogleMeetEventSubscription).not.toHaveBeenCalled();
    expect(
      ensureGoogleMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      googleUserId: '1234567890',
      pubsubTopic: PUBSUB_TOPIC,
      existingSubscription: undefined,
    });
    expect(
      storeGoogleMeetConnectionSubscription,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
      replacedSubscriptionName: undefined,
    });
  });

  it('should claim the subscription the Google account already has before using it', async () => {
    vi.mocked(findGoogleMeetEventSubscription).mockResolvedValue(
      EXISTING_SUBSCRIPTION,
    );

    await expect(
      googleMeetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({
      success: true,
      subscriptionName: 'subscriptions/first',
    });

    expect(claimGoogleMeetEventSubscription).toHaveBeenCalledExactlyOnceWith(
      'subscriptions/existing',
    );
    expect(
      ensureGoogleMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      googleUserId: '1234567890',
      pubsubTopic: PUBSUB_TOPIC,
      existingSubscription: EXISTING_SUBSCRIPTION,
    });
    expect(
      storeGoogleMeetConnectionSubscription,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
      replacedSubscriptionName: 'subscriptions/existing',
    });
  });

  it('should leave alone a subscription that another workspace owns', async () => {
    const claimError = new Error('Key is claimed by another workspace');

    vi.mocked(findGoogleMeetEventSubscription).mockResolvedValue(
      EXISTING_SUBSCRIPTION,
    );
    vi.mocked(claimGoogleMeetEventSubscription).mockRejectedValueOnce(
      claimError,
    );

    await expect(
      googleMeetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).rejects.toBe(claimError);

    expect(ensureGoogleMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
    expect(storeGoogleMeetConnectionSubscription).not.toHaveBeenCalled();
  });

  it('should fail when the Pub/Sub topic is not configured', async () => {
    vi.stubEnv('GOOGLE_MEET_PUBSUB_TOPIC', '');

    await expect(
      googleMeetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).rejects.toMatchObject({ code: 'PUBSUB_TOPIC_NOT_CONFIGURED' });

    expect(getConnection).not.toHaveBeenCalled();
  });

  it('should fail for a connection without Google account id', async () => {
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
      externalAccountId: null,
    });

    await expect(
      googleMeetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).rejects.toMatchObject({ code: 'ACCOUNT_NOT_IDENTIFIED' });

    expect(findGoogleMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should refuse a hook without connection', async () => {
    await expect(googleMeetRegisterConnectionHandler({})).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet connection hook',
    });

    expect(getConnection).not.toHaveBeenCalled();
  });
});
