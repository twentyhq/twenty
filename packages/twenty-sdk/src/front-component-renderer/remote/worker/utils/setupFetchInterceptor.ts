import { isArray, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { setWorkerEnv } from './setWorkerEnv';

const isAuthenticationError = (response: Response) => response.status === 401;

const hasGraphqlAuthenticationError = (payload: unknown) => {
  if (
    !isDefined(payload) ||
    !isObject(payload) ||
    !('errors' in payload) ||
    !isArray(payload.errors)
  ) {
    return false;
  }

  return payload.errors.some((error) => {
    const graphqlError = error as {
      message?: string;
      extensions?: { code?: string };
    };
    const message = graphqlError.message;
    const code = graphqlError.extensions?.code;

    return message === 'Unauthorized' || code === 'UNAUTHENTICATED';
  });
};

const isGraphqlAuthenticationErrorResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return false;
  }

  try {
    const payload = await response.clone().json();

    return hasGraphqlAuthenticationError(payload);
  } catch {
    return false;
  }
};

const isTrustedRequestUrl = ({
  requestUrl,
  trustedUrl,
}: {
  requestUrl: string;
  trustedUrl: URL;
}) => {
  let parsedRequestUrl: URL;

  try {
    parsedRequestUrl = new URL(requestUrl, trustedUrl);
  } catch {
    return false;
  }

  if (parsedRequestUrl.origin !== trustedUrl.origin) {
    return false;
  }

  if (trustedUrl.pathname === '/') {
    return true;
  }

  const normalizedTrustedPathname = trustedUrl.pathname.endsWith('/')
    ? trustedUrl.pathname.slice(0, -1)
    : trustedUrl.pathname;

  return (
    parsedRequestUrl.pathname === normalizedTrustedPathname ||
    parsedRequestUrl.pathname.startsWith(`${normalizedTrustedPathname}/`)
  );
};

export const setupFetchInterceptor = ({
  requestRefresh,
  trustedBaseUrl,
}: {
  requestRefresh: () => Promise<string>;
  trustedBaseUrl: string;
}) => {
  const originalFetch = globalThis.fetch;
  const trustedUrl = new URL(trustedBaseUrl);
  let refreshPromise: Promise<string> | null = null;

  globalThis.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url =
      input instanceof Request
        ? input.url
        : input instanceof URL
          ? input.toString()
          : String(input);
    const requestCloneForRetry =
      input instanceof Request ? input.clone() : null;
    const response = await originalFetch(input, init);
    const isTrustedRequest = isTrustedRequestUrl({
      requestUrl: url,
      trustedUrl,
    });
    const shouldRefreshBecause401 = isAuthenticationError(response);
    const shouldRefreshBecauseGraphqlAuthenticationError =
      !shouldRefreshBecause401 &&
      (await isGraphqlAuthenticationErrorResponse(response));

    if (
      !isTrustedRequest ||
      (!shouldRefreshBecause401 &&
        !shouldRefreshBecauseGraphqlAuthenticationError)
    ) {
      return response;
    }

    // Deduplicate concurrent refreshes
    if (!refreshPromise) {
      refreshPromise = requestRefresh()
        .then((newToken) => {
          setWorkerEnv({ TWENTY_APP_ACCESS_TOKEN: newToken });

          return newToken;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newToken = await refreshPromise.catch(() => null);

    if (!newToken) {
      return response;
    }

    // Retry once with new token
    const retryHeaders = new Headers(
      init?.headers ?? (input instanceof Request ? input.headers : undefined),
    );

    retryHeaders.set('Authorization', `Bearer ${newToken}`);

    if (requestCloneForRetry) {
      const retryRequest = new Request(requestCloneForRetry, {
        ...init,
        headers: retryHeaders,
      });

      return originalFetch(retryRequest);
    }

    return originalFetch(input, { ...init, headers: retryHeaders });
  };
};
