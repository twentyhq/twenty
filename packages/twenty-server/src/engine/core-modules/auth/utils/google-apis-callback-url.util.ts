export const GOOGLE_APIS_OAUTH_CALLBACK_PATH =
  '/auth/google-apis/get-access-token';

export const resolveGoogleApisCallbackUrl = ({
  callbackUrl,
  serverUrl,
}: {
  callbackUrl: string;
  serverUrl: string;
}) => {
  const fallbackCallbackUrl = new URL(
    GOOGLE_APIS_OAUTH_CALLBACK_PATH,
    serverUrl,
  ).toString();

  try {
    const parsedCallbackUrl = new URL(callbackUrl);

    if (parsedCallbackUrl.pathname === GOOGLE_APIS_OAUTH_CALLBACK_PATH) {
      return {
        callbackUrl,
        wasNormalized: false,
        normalizationReason: null,
      };
    }

    parsedCallbackUrl.pathname = GOOGLE_APIS_OAUTH_CALLBACK_PATH;
    parsedCallbackUrl.search = '';
    parsedCallbackUrl.hash = '';

    return {
      callbackUrl: parsedCallbackUrl.toString(),
      wasNormalized: true,
      normalizationReason: 'invalid_path' as const,
    };
  } catch {
    return {
      callbackUrl: fallbackCallbackUrl,
      wasNormalized: true,
      normalizationReason: 'invalid_url' as const,
    };
  }
};
