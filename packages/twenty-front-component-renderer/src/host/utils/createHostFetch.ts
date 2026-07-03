import { isDefined } from 'twenty-shared/utils';

import {
  type HostFetchFunction,
  type HostFetchInput,
  type HostFetchResult,
} from '@/types/HostFetch';

const toOrigin = (url: string): string | null => {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
};

export const createHostFetch = (
  allowedOrigins: string[],
): HostFetchFunction => {
  const allowedOriginSet = new Set(
    allowedOrigins.map(toOrigin).filter(isDefined),
  );

  return async (input: HostFetchInput): Promise<HostFetchResult> => {
    const requestOrigin = toOrigin(input.url);

    if (!isDefined(requestOrigin) || !allowedOriginSet.has(requestOrigin)) {
      throw new Error(
        `Front component host fetch blocked for disallowed origin: ${input.url}`,
      );
    }

    const response = await fetch(input.url, {
      method: input.method ?? 'GET',
      headers: input.headers,
      body: input.body,
      credentials: 'omit',
    });

    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    return {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
      body: await response.text(),
    };
  };
};
