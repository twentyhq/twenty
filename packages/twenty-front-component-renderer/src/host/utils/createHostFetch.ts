import { getURLSafely, isDefined } from 'twenty-shared/utils';

import {
  type HostFetchFunction,
  type HostFetchInput,
  type HostFetchResult,
} from '@/types/HostFetch';

export const createHostFetch = (
  allowedOrigins: string[],
): HostFetchFunction => {
  const allowedOriginSet = new Set(allowedOrigins);

  return async (input: HostFetchInput): Promise<HostFetchResult> => {
    const requestOrigin = getURLSafely(input.url)?.origin;

    if (!isDefined(requestOrigin) || !allowedOriginSet.has(requestOrigin)) {
      throw new Error(
        `Front component host fetch blocked for disallowed origin: ${input.url}`,
      );
    }

    const requestMethod = (input.method ?? 'GET').toUpperCase();
    const allowsFileStorageRedirects =
      requestMethod === 'GET' || requestMethod === 'HEAD';

    const response = await fetch(input.url, {
      method: requestMethod,
      headers: input.headers,
      body: input.body,
      credentials: 'omit',
      redirect: allowsFileStorageRedirects ? 'follow' : 'error',
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: await response.text(),
    };
  };
};
