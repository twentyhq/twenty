import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/create-google-meet-event-subscription-or-throw.util';
import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';
import { renewGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/renew-google-meet-event-subscription-or-throw.util';

const SUBSCRIPTION = {
  name: 'subscriptions/first',
  expireTime: '2026-11-24T09:00:00Z',
};

const JSON_REQUEST_HEADERS = {
  Authorization: 'Bearer token',
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('Google Meet event subscriptions', () => {
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

  it('should subscribe to the transcript events of a Google user', async () => {
    await expect(
      createGoogleMeetEventSubscriptionOrThrow({
        accessToken: 'token',
        googleUserId: '1234567890',
        pubsubTopic: 'projects/twenty/topics/google-meet',
      }),
    ).resolves.toEqual(SUBSCRIPTION);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://workspaceevents.googleapis.com/v1/subscriptions',
      {
        method: 'POST',
        redirect: 'error',
        headers: JSON_REQUEST_HEADERS,
        body: JSON.stringify({
          targetResource: '//cloudidentity.googleapis.com/users/1234567890',
          eventTypes: ['google.workspace.meet.transcript.v2.fileGenerated'],
          notificationEndpoint: {
            pubsubTopic: 'projects/twenty/topics/google-meet',
          },
        }),
      },
    );
  });

  it('should renew a subscription for the longest lifetime Google allows', async () => {
    await expect(
      renewGoogleMeetEventSubscriptionOrThrow({
        accessToken: 'token',
        subscriptionName: 'subscriptions/first',
      }),
    ).resolves.toEqual(SUBSCRIPTION);

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://workspaceevents.googleapis.com/v1/subscriptions/first?updateMask=ttl',
      {
        method: 'PATCH',
        redirect: 'error',
        headers: JSON_REQUEST_HEADERS,
        body: JSON.stringify({ ttl: '0s' }),
      },
    );
  });

  it('should delete a subscription even when Google no longer has it', async () => {
    await deleteGoogleMeetEventSubscription({
      accessToken: 'token',
      subscriptionName: 'subscriptions/first',
    });

    expect(fetchMock).toHaveBeenCalledExactlyOnceWith(
      'https://workspaceevents.googleapis.com/v1/subscriptions/first?allowMissing=true',
      {
        method: 'DELETE',
        redirect: 'error',
        headers: { Authorization: 'Bearer token', Accept: 'application/json' },
      },
    );
  });

  it('should refuse a subscription name that leaves the events API', async () => {
    await expect(
      renewGoogleMeetEventSubscriptionOrThrow({
        accessToken: 'token',
        subscriptionName: '../../other',
      }),
    ).rejects.toMatchObject({ code: 'INVALID_RESOURCE_PATH' });

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
