import { beforeEach, describe, expect, it, vi } from 'vitest';

import { GoogleMeetException } from 'src/logic-functions/types/google-meet-exception.type';
import { isGooglePubsubPushAuthorized } from 'src/logic-functions/utils/is-google-pubsub-push-authorized.util';
import { verifyGooglePubsubPushTokenOrThrow } from 'src/logic-functions/utils/verify-google-pubsub-push-token-or-throw.util';

vi.mock(
  'src/logic-functions/utils/verify-google-pubsub-push-token-or-throw.util',
  () => ({ verifyGooglePubsubPushTokenOrThrow: vi.fn() }),
);

const PUSH_REQUEST = {
  authorizationHeader: 'Bearer token',
  audience: 'https://twenty.example.com/google-meet',
  serviceAccountEmail: 'google-meet-push@twenty.iam.gserviceaccount.com',
};

describe('isGooglePubsubPushAuthorized', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should authorize a request whose token is valid', async () => {
    vi.mocked(verifyGooglePubsubPushTokenOrThrow).mockResolvedValue(undefined);

    await expect(isGooglePubsubPushAuthorized(PUSH_REQUEST)).resolves.toBe(
      true,
    );

    expect(verifyGooglePubsubPushTokenOrThrow).toHaveBeenCalledExactlyOnceWith(
      PUSH_REQUEST,
    );
  });

  it('should refuse a request whose token is invalid', async () => {
    vi.mocked(verifyGooglePubsubPushTokenOrThrow).mockRejectedValue(
      new GoogleMeetException({
        message: 'The Pub/Sub push token is invalid',
        code: 'PUSH_TOKEN_INVALID',
      }),
    );

    await expect(isGooglePubsubPushAuthorized(PUSH_REQUEST)).resolves.toBe(
      false,
    );
  });

  it('should fail when the token could not be checked', async () => {
    const networkError = new TypeError('fetch failed');

    vi.mocked(verifyGooglePubsubPushTokenOrThrow).mockRejectedValue(
      networkError,
    );

    await expect(isGooglePubsubPushAuthorized(PUSH_REQUEST)).rejects.toBe(
      networkError,
    );
  });
});
