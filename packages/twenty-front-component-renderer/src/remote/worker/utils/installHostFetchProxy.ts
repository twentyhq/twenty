import { getURLSafely, isDefined } from 'twenty-shared/utils';

import { type HostFetchFunction } from '@/types/HostFetch';

const URL_SEARCH_PARAMS_CONTENT_TYPE =
  'application/x-www-form-urlencoded;charset=UTF-8';

const isRequestInput = (input: RequestInfo | URL): input is Request =>
  typeof input === 'object' && !(input instanceof URL);

const toRequestUrl = (input: RequestInfo | URL): string => {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return input.url;
};

const toRequestMethod = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): string => init?.method ?? (isRequestInput(input) ? input.method : 'GET');

const toHeaderRecord = (
  headers: HeadersInit | undefined,
): Record<string, string> => {
  const record: Record<string, string> = {};

  if (isDefined(headers)) {
    new Headers(headers).forEach((value, key) => {
      record[key] = value;
    });
  }

  return record;
};

const toProxiedHeaders = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Record<string, string> => {
  if (isDefined(init?.headers)) {
    return toHeaderRecord(init.headers);
  }

  if (isRequestInput(input)) {
    return toHeaderRecord(input.headers);
  }

  return {};
};

const isTextContentType = (contentType: string): boolean => {
  const mimeType = contentType.split(';')[0].trim().toLowerCase();

  return (
    mimeType.startsWith('text/') ||
    mimeType === 'application/x-www-form-urlencoded' ||
    mimeType === 'application/graphql' ||
    mimeType.endsWith('json') ||
    mimeType.endsWith('xml')
  );
};

const toRequestInputBody = async (
  input: Request,
): Promise<string | undefined> => {
  const requestBody = await input.clone().text();

  if (requestBody === '') {
    return undefined;
  }

  const contentType = input.headers.get('content-type');

  if (isDefined(contentType) && !isTextContentType(contentType)) {
    throw new TypeError(
      `The front component fetch bridge only supports text request bodies for Twenty API requests, got content type: ${contentType}`,
    );
  }

  return requestBody;
};

const toProxiedBody = async (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Promise<string | undefined> => {
  const initBody = init?.body;

  if (!isDefined(initBody)) {
    if (isRequestInput(input)) {
      return toRequestInputBody(input);
    }

    return undefined;
  }

  if (typeof initBody === 'string') {
    return initBody;
  }

  if (initBody instanceof URLSearchParams) {
    return initBody.toString();
  }

  throw new TypeError(
    'The front component fetch bridge only supports string and URLSearchParams request bodies for Twenty API requests',
  );
};

const isProxiedOrigin = (url: string, proxiedOrigins: string[]): boolean => {
  const origin = getURLSafely(url)?.origin;

  return isDefined(origin) && proxiedOrigins.includes(origin);
};

export const installHostFetchProxy = (
  hostFetch: HostFetchFunction,
  proxiedOrigins: string[],
): void => {
  const nativeFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    const url = toRequestUrl(input);

    if (!isProxiedOrigin(url, proxiedOrigins)) {
      return nativeFetch(input, init);
    }

    const headers = toProxiedHeaders(input, init);

    if (
      init?.body instanceof URLSearchParams &&
      !isDefined(headers['content-type'])
    ) {
      headers['content-type'] = URL_SEARCH_PARAMS_CONTENT_TYPE;
    }

    const result = await hostFetch({
      url,
      method: toRequestMethod(input, init),
      headers,
      body: await toProxiedBody(input, init),
    });

    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
    });
  };
};
