import { isArray, isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { setWorkerEnv } from './setWorkerEnv';

const isAuthenticationError = (response: Response) => response.status === 401;

type FetchInterceptorState = {
  originalFetch: typeof globalThis.fetch | null;
  trustedUrl: URL | null;
  requestRefresh: (() => Promise<string>) | null;
  refreshPromise: Promise<string> | null;
};

const fetchInterceptorState: FetchInterceptorState = {
  originalFetch: null,
  trustedUrl: null,
  requestRefresh: null,
  refreshPromise: null,
};

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
  try {
    const parsedRequestUrl = new URL(requestUrl, trustedUrl);

    return parsedRequestUrl.origin === trustedUrl.origin;
  } catch {
    return false;
  }
};

const extractUrlFromInput = (input: RequestInfo | URL): string => {
  if (input instanceof Request) {
    return input.url;
  }

  if (input instanceof URL) {
    return input.toString();
  }

  return String(input);
};

export const resetFetchInterceptor = () => {
  if (isDefined(fetchInterceptorState.originalFetch)) {
    globalThis.fetch = fetchInterceptorState.originalFetch;
  }

  fetchInterceptorState.originalFetch = null;
  fetchInterceptorState.trustedUrl = null;
  fetchInterceptorState.requestRefresh = null;
  fetchInterceptorState.refreshPromise = null;
};

const refreshAccessToken = async (): Promise<string | null> => {
  if (!isDefined(fetchInterceptorState.requestRefresh)) {
    return null;
  }

  if (!isDefined(fetchInterceptorState.refreshPromise)) {
    fetchInterceptorState.refreshPromise = fetchInterceptorState
      .requestRefresh()
      .then((newToken) => {
        setWorkerEnv({ TWENTY_APP_ACCESS_TOKEN: newToken });

        return newToken;
      })
      .finally(() => {
        fetchInterceptorState.refreshPromise = null;
      });
  }

  return fetchInterceptorState.refreshPromise.catch(() => null);
};

const retryWithRefreshedToken = async ({
  baseFetch,
  input,
  init,
  requestCloneForRetry,
  token,
}: {
  baseFetch: typeof globalThis.fetch;
  input: RequestInfo | URL;
  init?: RequestInit;
  requestCloneForRetry: Request | null;
  token: string;
}): Promise<Response | null> => {
  const retryHeaders = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );

  retryHeaders.set('Authorization', `Bearer ${token}`);

  try {
    if (isDefined(requestCloneForRetry)) {
      const retryRequest = new Request(requestCloneForRetry, {
        ...init,
        headers: retryHeaders,
      });

      return await baseFetch(retryRequest);
    }

    return await baseFetch(input, { ...init, headers: retryHeaders });
  } catch {
    return null;
  }
};

export const setupFetchInterceptor = ({
  requestRefresh,
  trustedBaseUrl,
}: {
  requestRefresh: () => Promise<string>;
  trustedBaseUrl: string;
}) => {
  fetchInterceptorState.trustedUrl = new URL(trustedBaseUrl);
  fetchInterceptorState.requestRefresh = requestRefresh;

  if (isDefined(fetchInterceptorState.originalFetch)) {
    return;
  }

  const baseFetch = globalThis.fetch;
  fetchInterceptorState.originalFetch = baseFetch;

  globalThis.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const trustedUrl = fetchInterceptorState.trustedUrl;

    if (!isDefined(trustedUrl)) {
      return baseFetch(input, init);
    }

    const url = extractUrlFromInput(input);

    if (!isTrustedRequestUrl({ requestUrl: url, trustedUrl })) {
      return baseFetch(input, init);
    }

    const requestCloneForRetry =
      input instanceof Request ? input.clone() : null;
    const response = await baseFetch(input, init);
    const shouldRefreshBecause401 = isAuthenticationError(response);
    const shouldRefreshBecauseGraphqlAuthenticationError =
      !shouldRefreshBecause401 &&
      (await isGraphqlAuthenticationErrorResponse(response));

    if (
      !shouldRefreshBecause401 &&
      !shouldRefreshBecauseGraphqlAuthenticationError
    ) {
      return response;
    }

    const newToken = await refreshAccessToken();

    if (!newToken) {
      return response;
    }

    const retryResponse = await retryWithRefreshedToken({
      baseFetch,
      input,
      init,
      requestCloneForRetry,
      token: newToken,
    });

    return retryResponse ?? response;
  };
};
