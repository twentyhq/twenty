import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteGoogleMeetEventSubscription } from 'src/logic-functions/utils/delete-google-meet-event-subscription.util';

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('deleteGoogleMeetEventSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockImplementation(
      async () => new Response(JSON.stringify({ done: true })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
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
});
