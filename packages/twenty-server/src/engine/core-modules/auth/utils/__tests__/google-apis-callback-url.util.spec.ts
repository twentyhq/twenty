import {
  GOOGLE_APIS_OAUTH_CALLBACK_PATH,
  resolveGoogleApisCallbackUrl,
} from 'src/engine/core-modules/auth/utils/google-apis-callback-url.util';

describe('resolveGoogleApisCallbackUrl', () => {
  it('should keep callback URL when path is valid', () => {
    const callbackUrl =
      'https://api.twenty.com/auth/google-apis/get-access-token';

    const result = resolveGoogleApisCallbackUrl({
      callbackUrl,
      serverUrl: 'https://fallback.twenty.com',
    });

    expect(result).toEqual({
      callbackUrl,
      wasNormalized: false,
      normalizationReason: null,
    });
  });

  it('should normalize callback URL path when path is invalid', () => {
    const result = resolveGoogleApisCallbackUrl({
      callbackUrl: 'https://api.twenty.com/api/auth/callback/google?state=abc',
      serverUrl: 'https://fallback.twenty.com',
    });

    expect(result).toEqual({
      callbackUrl: `https://api.twenty.com${GOOGLE_APIS_OAUTH_CALLBACK_PATH}`,
      wasNormalized: true,
      normalizationReason: 'invalid_path',
    });
  });

  it('should fallback to SERVER_URL when callback URL is invalid', () => {
    const result = resolveGoogleApisCallbackUrl({
      callbackUrl: 'not-a-url',
      serverUrl: 'https://fallback.twenty.com',
    });

    expect(result).toEqual({
      callbackUrl: `https://fallback.twenty.com${GOOGLE_APIS_OAUTH_CALLBACK_PATH}`,
      wasNormalized: true,
      normalizationReason: 'invalid_url',
    });
  });
});
