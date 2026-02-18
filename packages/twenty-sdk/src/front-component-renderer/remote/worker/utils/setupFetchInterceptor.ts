import { setWorkerEnv } from './setWorkerEnv';

type GraphqlErrorExtension = {
  code?: string;
  subCode?: string;
};

type GraphqlErrorLike = {
  extensions?: GraphqlErrorExtension;
};

const hasUnauthenticatedGraphqlError = (payload: unknown) => {
  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('errors' in payload) ||
    !Array.isArray(payload.errors)
  ) {
    return false;
  }

  return payload.errors.some((error) => {
    const maybeGraphqlError = error as GraphqlErrorLike;
    const code = maybeGraphqlError.extensions?.code;
    const subCode = maybeGraphqlError.extensions?.subCode;

    return code === 'UNAUTHENTICATED' || subCode === 'UNAUTHENTICATED';
  });
};

const isGraphqlUnauthenticatedResponse = async (response: Response) => {
  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return false;
  }

  try {
    const payload = await response.clone().json();

    return hasUnauthenticatedGraphqlError(payload);
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
    const shouldRefreshBecause401 = response.status === 401;
    const shouldRefreshBecauseGraphqlUnauthenticated =
      !shouldRefreshBecause401 &&
      (await isGraphqlUnauthenticatedResponse(response));

    if (
      !isTrustedRequest ||
      (!shouldRefreshBecause401 && !shouldRefreshBecauseGraphqlUnauthenticated)
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
