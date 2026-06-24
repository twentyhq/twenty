import {
  DEFAULT_API_KEY_NAME,
  DEFAULT_API_URL_NAME,
  DEFAULT_APP_ACCESS_TOKEN_NAME,
  DEFAULT_FUNCTIONS_URL_NAME,
} from 'twenty-shared/application';

const isDefined = <T>(value: T): value is NonNullable<T> =>
  value !== null && value !== undefined;

export type RestApiClientOptions = {
  functionUrl?: string;
  workspaceUrl?: string;
  token?: string;
  fetch?: typeof globalThis.fetch;
  defaultHeaders?: HeadersInit;
};

export type RestApiRequestOptions = {
  headers?: HeadersInit;
  query?: Record<string, string | number | boolean | null | undefined>;
  signal?: AbortSignal;
};

type RestApiClientErrorDetails = {
  status?: number;
  statusText?: string;
  url?: string;
  body?: unknown;
};

export class RestApiClientError extends Error {
  readonly status?: number;
  readonly statusText?: string;
  readonly url?: string;
  readonly body?: unknown;

  constructor(message: string, details?: RestApiClientErrorDetails) {
    super(message);
    this.name = 'RestApiClientError';
    this.status = details?.status;
    this.statusText = details?.statusText;
    this.url = details?.url;
    this.body = details?.body;
  }
}

type ProcessEnvironment = Record<string, string | undefined>;

const getProcessEnvironment = (): ProcessEnvironment => {
  const processObject = (
    globalThis as { process?: { env?: ProcessEnvironment } }
  ).process;

  return processObject?.env ?? {};
};

const normalizeBaseUrl = (value: string): string =>
  value.trim().replace(/\/+$/, '');

const buildRequestUrl = (
  baseUrl: string,
  path: string,
  query: RestApiRequestOptions['query'],
): string => {
  const url = /^https?:\/\//i.test(path)
    ? path
    : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  if (!isDefined(query)) {
    return url;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (isDefined(value)) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();

  if (queryString.length === 0) {
    return url;
  }

  return url.includes('?') ? `${url}&${queryString}` : `${url}?${queryString}`;
};

export class RestApiClient {
  private functionUrl: string | undefined;
  private workspaceUrl: string | undefined;
  private token: string | undefined;
  private defaultHeaders: HeadersInit | undefined;
  private fetchImplementation: typeof globalThis.fetch | null;
  private authorizationToken: string | null;
  private refreshAccessTokenPromise: Promise<string | null> | null = null;

  constructor(options?: RestApiClientOptions) {
    this.functionUrl = options?.functionUrl;
    this.workspaceUrl = options?.workspaceUrl;
    this.token = options?.token;
    this.defaultHeaders = options?.defaultHeaders;
    this.fetchImplementation = options?.fetch ?? globalThis.fetch ?? null;
    this.authorizationToken = options?.token ?? null;
  }

  request<TResponse = unknown>(
    method: string,
    path: string,
    options?: RestApiRequestOptions & { body?: unknown },
  ) {
    return this.execute<TResponse>(method, path, options?.body, options);
  }

  get<TResponse = unknown>(path: string, options?: RestApiRequestOptions) {
    return this.execute<TResponse>('GET', path, undefined, options);
  }

  post<TResponse = unknown>(
    path: string,
    body?: unknown,
    options?: RestApiRequestOptions,
  ) {
    return this.execute<TResponse>('POST', path, body, options);
  }

  put<TResponse = unknown>(
    path: string,
    body?: unknown,
    options?: RestApiRequestOptions,
  ) {
    return this.execute<TResponse>('PUT', path, body, options);
  }

  patch<TResponse = unknown>(
    path: string,
    body?: unknown,
    options?: RestApiRequestOptions,
  ) {
    return this.execute<TResponse>('PATCH', path, body, options);
  }

  delete<TResponse = unknown>(path: string, options?: RestApiRequestOptions) {
    return this.execute<TResponse>('DELETE', path, undefined, options);
  }

  private resolveWorkspaceUrl(): string | undefined {
    const workspaceUrl =
      this.workspaceUrl ?? getProcessEnvironment()[DEFAULT_API_URL_NAME];

    if (!isDefined(workspaceUrl)) {
      return undefined;
    }

    const normalizedWorkspaceUrl = normalizeBaseUrl(workspaceUrl);

    return normalizedWorkspaceUrl.length === 0
      ? undefined
      : normalizedWorkspaceUrl;
  }

  private resolveToken(): string {
    if (!isDefined(this.authorizationToken)) {
      const processEnvironment = getProcessEnvironment();

      this.authorizationToken =
        this.token ??
        processEnvironment[DEFAULT_APP_ACCESS_TOKEN_NAME] ??
        processEnvironment[DEFAULT_API_KEY_NAME] ??
        null;
    }

    if (
      !isDefined(this.authorizationToken) ||
      this.authorizationToken.length === 0
    ) {
      throw new RestApiClientError(
        `Missing application access token. Set the \`${DEFAULT_APP_ACCESS_TOKEN_NAME}\` environment variable or pass \`token\` to \`RestApiClient\`.`,
      );
    }

    return this.authorizationToken;
  }

  private async requestRefreshedAccessToken(): Promise<string | null> {
    const refreshAccessTokenFunction = (
      globalThis as {
        frontComponentHostCommunicationApi?: {
          requestAccessTokenRefresh?: () => Promise<string>;
        };
      }
    ).frontComponentHostCommunicationApi?.requestAccessTokenRefresh;

    if (typeof refreshAccessTokenFunction !== 'function') {
      return null;
    }

    if (!this.refreshAccessTokenPromise) {
      this.refreshAccessTokenPromise = refreshAccessTokenFunction()
        .then((refreshedAccessToken) => {
          if (
            typeof refreshedAccessToken !== 'string' ||
            refreshedAccessToken.length === 0
          ) {
            return null;
          }

          this.authorizationToken = refreshedAccessToken;
          getProcessEnvironment()[DEFAULT_APP_ACCESS_TOKEN_NAME] =
            refreshedAccessToken;

          return refreshedAccessToken;
        })
        .catch((refreshError: unknown) => {
          console.error(
            'Twenty REST client: token refresh failed',
            refreshError,
          );

          return null;
        })
        .finally(() => {
          this.refreshAccessTokenPromise = null;
        });
    }

    return this.refreshAccessTokenPromise;
  }

  private sendRequest(
    url: string,
    method: string,
    body: unknown,
    token: string,
    requestOptions?: RestApiRequestOptions,
  ): Promise<Response> {
    if (!isDefined(this.fetchImplementation)) {
      throw new RestApiClientError(
        'Global `fetch` function is not available, pass a fetch implementation to `RestApiClient`.',
      );
    }

    const requestHeaders = new Headers(this.defaultHeaders);

    if (isDefined(requestOptions?.headers)) {
      new Headers(requestOptions.headers).forEach((value, key) =>
        requestHeaders.set(key, value),
      );
    }

    const isFormDataBody =
      typeof FormData !== 'undefined' && body instanceof FormData;
    const shouldSerializeBody =
      isDefined(body) && !isFormDataBody && typeof body !== 'string';

    if (isFormDataBody) {
      requestHeaders.delete('Content-Type');
    } else if (shouldSerializeBody) {
      requestHeaders.set('Content-Type', 'application/json');
    }

    requestHeaders.set('Authorization', `Bearer ${token}`);

    const serializedBody = !isDefined(body)
      ? undefined
      : isFormDataBody || typeof body === 'string'
        ? (body as BodyInit)
        : JSON.stringify(body);

    return this.fetchImplementation.call(globalThis, url, {
      method,
      headers: requestHeaders,
      body: serializedBody,
      signal: requestOptions?.signal,
    });
  }

  private async parseResponse<TResponse>(
    response: Response,
    url: string,
  ): Promise<TResponse> {
    const rawBody = await response.text();
    let parsedBody: unknown = undefined;

    if (rawBody.trim().length > 0) {
      try {
        parsedBody = JSON.parse(rawBody);
      } catch {
        parsedBody = rawBody;
      }
    }

    if (!response.ok) {
      throw new RestApiClientError(
        `Request to ${url} failed with status ${response.status} ${response.statusText}`,
        {
          status: response.status,
          statusText: response.statusText,
          url,
          body: parsedBody,
        },
      );
    }

    return parsedBody as TResponse;
  }

  private resolveFunctionUrl(): string | undefined {
    const functionUrl =
      this.functionUrl ?? getProcessEnvironment()[DEFAULT_FUNCTIONS_URL_NAME];

    if (!isDefined(functionUrl)) {
      return undefined;
    }

    const normalizedFunctionUrl = normalizeBaseUrl(functionUrl);

    return normalizedFunctionUrl.length === 0
      ? undefined
      : normalizedFunctionUrl;
  }

  private resolveRequestBaseUrl(): string {
    const baseUrl = this.resolveFunctionUrl() ?? this.resolveWorkspaceUrl();

    if (!isDefined(baseUrl)) {
      throw new RestApiClientError(
        `Missing API url. Set the \`${DEFAULT_FUNCTIONS_URL_NAME}\` (or \`${DEFAULT_API_URL_NAME}\`) environment variable, or pass \`functionUrl\` / \`workspaceUrl\` to \`RestApiClient\`.`,
      );
    }

    return baseUrl;
  }

  private async execute<TResponse>(
    method: string,
    path: string,
    body: unknown,
    requestOptions?: RestApiRequestOptions,
  ): Promise<TResponse> {
    const url = buildRequestUrl(
      this.resolveRequestBaseUrl(),
      path,
      requestOptions?.query,
    );
    const token = this.resolveToken();

    let response = await this.sendRequest(
      url,
      method,
      body,
      token,
      requestOptions,
    );

    if (response.status === 401) {
      const refreshedAccessToken = await this.requestRefreshedAccessToken();

      if (isDefined(refreshedAccessToken)) {
        response = await this.sendRequest(
          url,
          method,
          body,
          refreshedAccessToken,
          requestOptions,
        );
      }
    }

    return this.parseResponse<TResponse>(response, url);
  }
}
