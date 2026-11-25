import { getConnection } from 'twenty-sdk/logic-function';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { meetRegisterConnectionHandler } from 'src/logic-functions/meet-register-connection';
import { claimMeetEventSubscription } from 'src/logic-functions/utils/claim-meet-event-subscription.util';
import { ensureMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/ensure-meet-event-subscription-or-throw.util';
import { findMeetEventSubscription } from 'src/logic-functions/utils/find-meet-event-subscription.util';
import { storeMeetConnectionSubscription } from 'src/logic-functions/utils/store-meet-connection-subscription.util';

vi.mock('twenty-sdk/logic-function', () => ({ getConnection: vi.fn() }));

vi.mock(
  'src/logic-functions/utils/find-meet-event-subscription.util',
  () => ({ findMeetEventSubscription: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/claim-meet-event-subscription.util',
  () => ({ claimMeetEventSubscription: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/ensure-meet-event-subscription-or-throw.util',
  () => ({ ensureMeetEventSubscriptionOrThrow: vi.fn() }),
);

vi.mock(
  'src/logic-functions/utils/store-meet-connection-subscription.util',
  () => ({ storeMeetConnectionSubscription: vi.fn() }),
);

const PUBSUB_TOPIC = 'projects/twenty/topics/meet';
const SUBSCRIPTION = { name: 'subscriptions/first' };
const EXISTING_SUBSCRIPTION = { name: 'subscriptions/existing' };

describe('meetRegisterConnectionHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GOOGLE_MEET_PUBSUB_TOPIC', PUBSUB_TOPIC);
    vi.mocked(getConnection, { partial: true }).mockResolvedValue({
      id: 'connected-account-id',
      accessToken: 'token',
      externalAccountId: '1234567890',
    });
    vi.mocked(findMeetEventSubscription).mockResolvedValue(undefined);
    vi.mocked(ensureMeetEventSubscriptionOrThrow).mockResolvedValue(
      SUBSCRIPTION,
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should subscribe to the events of the connected Google account', async () => {
    await expect(
      meetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({
      success: true,
      subscriptionName: 'subscriptions/first',
    });

    expect(getConnection).toHaveBeenCalledExactlyOnceWith(
      'connected-account-id',
    );
    expect(findMeetEventSubscription).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      googleUserId: '1234567890',
    });
    expect(claimMeetEventSubscription).not.toHaveBeenCalled();
    expect(
      ensureMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      googleUserId: '1234567890',
      pubsubTopic: PUBSUB_TOPIC,
      existingSubscription: undefined,
    });
    expect(
      storeMeetConnectionSubscription,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
      replacedSubscriptionName: undefined,
    });
  });

  it('should claim the subscription the Google account already has before using it', async () => {
    vi.mocked(findMeetEventSubscription).mockResolvedValue(
      EXISTING_SUBSCRIPTION,
    );

    await expect(
      meetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).resolves.toEqual({
      success: true,
      subscriptionName: 'subscriptions/first',
    });

    expect(claimMeetEventSubscription).toHaveBeenCalledExactlyOnceWith(
      'subscriptions/existing',
    );
    expect(
      ensureMeetEventSubscriptionOrThrow,
    ).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      googleUserId: '1234567890',
      pubsubTopic: PUBSUB_TOPIC,
      existingSubscription: EXISTING_SUBSCRIPTION,
    });
    expect(
      storeMeetConnectionSubscription,
    ).toHaveBeenCalledExactlyOnceWith({
      connectedAccountId: 'connected-account-id',
      subscriptionName: 'subscriptions/first',
      replacedSubscriptionName: 'subscriptions/existing',
    });
  });

  it('should leave alone a subscription that another workspace owns', async () => {
    const claimError = new Error('Key is claimed by another workspace');

    vi.mocked(findMeetEventSubscription).mockResolvedValue(
      EXISTING_SUBSCRIPTION,
    );
    vi.mocked(claimMeetEventSubscription).mockRejectedValueOnce(
      claimError,
    );

    await expect(
      meetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).rejects.toBe(claimError);

    expect(ensureMeetEventSubscriptionOrThrow).not.toHaveBeenCalled();
    expect(storeMeetConnectionSubscription).not.toHaveBeenCalled();
  });

  it('should fail when the Pub/Sub topic is not configured', async () => {
    vi.stubEnv('GOOGLE_MEET_PUBSUB_TOPIC', '');

    await expect(
      meetRegisterConnectionHandler({
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
      meetRegisterConnectionHandler({
        connectedAccountId: 'connected-account-id',
      }),
    ).rejects.toMatchObject({ code: 'ACCOUNT_NOT_IDENTIFIED' });

    expect(findMeetEventSubscription).not.toHaveBeenCalled();
  });

  it('should refuse a hook without connection', async () => {
    await expect(meetRegisterConnectionHandler({})).resolves.toEqual({
      success: false,
      error: 'Invalid Google Meet connection hook',
    });

    expect(getConnection).not.toHaveBeenCalled();
  });
});
