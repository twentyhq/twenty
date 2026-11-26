import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { deleteMeetEventSubscription } from 'src/logic-functions/utils/delete-meet-event-subscription.util';

const fetchMock = vi.fn<(url: string, init: object) => Promise<Response>>();

describe('deleteMeetEventSubscription', () => {
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
    await deleteMeetEventSubscription({
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
