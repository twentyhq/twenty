import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createGoogleMeetEventSubscriptionOrThrow } from 'src/logic-functions/utils/create-google-meet-event-subscription-or-throw.util';

const SUBSCRIPTION = {
  name: 'subscriptions/first',
  expireTime: '2026-11-24T09:00:00Z',
};

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('createGoogleMeetEventSubscriptionOrThrow', () => {
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
        headers: {
          Authorization: 'Bearer token',
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetResource: '//cloudidentity.googleapis.com/users/1234567890',
          eventTypes: [
            'google.workspace.meet.transcript.v2.fileGenerated',
            'google.workspace.meet.smartNote.v2.fileGenerated',
            'google.workspace.meet.recording.v2.fileGenerated',
          ],
          notificationEndpoint: {
            pubsubTopic: 'projects/twenty/topics/google-meet',
          },
        }),
      },
    );
  });
});
