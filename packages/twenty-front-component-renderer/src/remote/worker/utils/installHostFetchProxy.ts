import { getURLSafely, isDefined } from 'twenty-shared/utils';

import { type HostFetchFunction } from '@/types/HostFetch';

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
): string =>
  init?.method ??
  (typeof input === 'object' && !(input instanceof URL) ? input.method : 'GET');

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

    const result = await hostFetch({
      url,
      method: toRequestMethod(input, init),
      headers: toHeaderRecord(init?.headers),
      body: typeof init?.body === 'string' ? init.body : undefined,
    });

    return new Response(result.body, {
      status: result.status,
      statusText: result.statusText,
      headers: result.headers,
    });
  };
};
