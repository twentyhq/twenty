import { z } from 'zod';

const componentSourceHandoffSchema = z.object({ url: z.url() });

// Changes the HTTP cache key so component responses cached before the
// front-component cache fix are bypassed instead of served corrupted.
const CACHE_BUST_QUERY_PARAMETER_NAME = 'cacheBust';
const CACHE_BUST_QUERY_PARAMETER_VALUE = 'v2';

const appendCacheBustQueryParameter = (url: string): string => {
  try {
    const parsedUrl = new URL(url);

    parsedUrl.searchParams.set(
      CACHE_BUST_QUERY_PARAMETER_NAME,
      CACHE_BUST_QUERY_PARAMETER_VALUE,
    );

    return parsedUrl.toString();
  } catch {
    return url;
  }
};

export const fetchComponentSourceFromNetwork = async ({
  url,
  headers,
}: {
  url: string;
  headers?: Record<string, string>;
}): Promise<string> => {
  const response = await fetch(appendCacheBustQueryParameter(url), {
    headers,
    credentials: 'omit',
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${url}: ${response.status} ${response.statusText}`,
    );
  }

  const contentType = response.headers.get('content-type') ?? '';

  if (!contentType.includes('application/json')) {
    return response.text();
  }

  const handoff = componentSourceHandoffSchema.safeParse(await response.json());

  if (!handoff.success) {
    throw new Error(`Invalid component source handoff response from ${url}`);
  }

  const presignedResponse = await fetch(handoff.data.url, {
    credentials: 'omit',
  });

  if (!presignedResponse.ok) {
    throw new Error(
      `Failed to fetch presigned URL: ${presignedResponse.status} ${presignedResponse.statusText}`,
    );
  }

  return presignedResponse.text();
};
