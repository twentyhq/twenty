import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { renewMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/renew-meet-event-subscription-or-throw.util';

const SUBSCRIPTION = {
  name: 'subscriptions/first',
  expireTime: '2026-11-24T09:00:00Z',
};

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('renewMeetEventSubscriptionOrThrow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockImplementation(
      async () =>
        new Response(JSON.stringify({ done: true, response: SUBSCRIPTION })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should renew a subscription for the longest lifetime Google allows', async () => {
    await expect(
      renewMeetEventSubscriptionOrThrow({
        accessToken: 'token',
        subscriptionName: 'subscriptions/first',
      }),
    ).resolves.toEqual(SUBSCRIPTION);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://workspaceevents.googleapis.com/v1/subscriptions/first?updateMask=ttl',
      {
        method: 'PATCH',
        redirect: 'error',
        headers: {
          Authorization: 'Bearer token',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttl: '0s' }),
      },
    );
  });

  it('should refuse a subscription name that leaves the events API', async () => {
    await expect(
      renewMeetEventSubscriptionOrThrow({
        accessToken: 'token',
        subscriptionName: '../../other',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_RESOURCE_PATH' });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
