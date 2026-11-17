import { beforeEach, describe, expect, it, vi } from 'vitest';

import { googleMeetIdentifyAccountHandler } from 'src/logic-functions/google-meet-identify-account';
import { fetchGoogleMeetJson } from 'src/logic-functions/utils/fetch-google-meet-json.util';

vi.mock('src/logic-functions/utils/fetch-google-meet-json.util', () => ({
  fetchGoogleMeetJson: vi.fn(),
}));

const IDENTIFY_ACCOUNT_PAYLOAD = {
  connectionProviderId: 'connection-provider-id',
  connectionProviderName: 'google-meet-user',
  accessToken: 'token',
};

describe('googleMeetIdentifyAccountHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the Google account id and email of the token', async () => {
    vi.mocked(fetchGoogleMeetJson).mockResolvedValue({
      sub: '1234567890',
      email: 'jane@example.com',
    });

    await expect(
      googleMeetIdentifyAccountHandler(IDENTIFY_ACCOUNT_PAYLOAD),
    ).resolves.toEqual({
      externalAccountId: '1234567890',
      handle: 'jane@example.com',
    });

    expect(fetchGoogleMeetJson).toHaveBeenCalledExactlyOnceWith({
      accessToken: 'token',
      url: 'https://openidconnect.googleapis.com/v1/userinfo',
    });
  });

  it('should return only the account id when Google returns no email', async () => {
    vi.mocked(fetchGoogleMeetJson).mockResolvedValue({ sub: '1234567890' });

    await expect(
      googleMeetIdentifyAccountHandler(IDENTIFY_ACCOUNT_PAYLOAD),
    ).resolves.toEqual({ externalAccountId: '1234567890' });
  });

  it('should refuse the connection when Google returns no account id', async () => {
    vi.mocked(fetchGoogleMeetJson).mockResolvedValue({});

    await expect(
      googleMeetIdentifyAccountHandler(IDENTIFY_ACCOUNT_PAYLOAD),
    ).rejects.toMatchObject({ code: 'ACCOUNT_NOT_IDENTIFIED' });
  });
});
