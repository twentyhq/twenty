import { beforeEach, describe, expect, it, vi } from 'vitest';

import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';
import { findGoogleMeetEventSubscription } from 'src/logic-functions/utils/find-google-meet-event-subscription.util';

vi.mock('src/logic-functions/utils/fetch-google-meet-json.util', () => ({
  fetchGoogleMeetJson: vi.fn(),
}));

const SUBSCRIPTION = { name: 'subscriptions/first' };

describe('findGoogleMeetEventSubscription', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the transcript subscription of the Google user', async () => {
    vi.mocked(fetchGoogleMeetJson).mockResolvedValue({
      subscriptions: [SUBSCRIPTION],
    });

    await expect(
      findGoogleMeetEventSubscription({
        accessToken: 'token',
        googleUserId: '1234567890',
      }),
    ).resolves.toEqual(SUBSCRIPTION);

    expect(fetchGoogleMeetJson).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      url: 'https://workspaceevents.googleapis.com/v1/subscriptions?filter=event_types%3A%22google.workspace.meet.transcript.v2.fileGenerated%22+AND+target_resource%3D%22%2F%2Fcloudidentity.googleapis.com%2Fusers%2F1234567890%22',
    });
  });

  it('should return nothing when the Google user has no subscription', async () => {
    vi.mocked(fetchGoogleMeetJson).mockResolvedValue({});

    await expect(
      findGoogleMeetEventSubscription({
        accessToken: 'token',
        googleUserId: '1234567890',
      }),
    ).resolves.toBeUndefined();
  });
});
