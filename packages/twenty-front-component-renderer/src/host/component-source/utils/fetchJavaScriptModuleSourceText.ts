import { CustomError } from 'twenty-shared/utils';

// Plain fetch for a JavaScript module served directly from a content-addressed,
// immutable URL. The browser HTTP cache handles both reuse and checksum-based
// invalidation (a new checksum yields a new URL), so no host-side CacheStorage
// layer is needed here — that layer exists only to cache front-component
// sources across the rotating presigned URLs they are served through.
export const fetchJavaScriptModuleSourceText = async (
  url: string,
  headers?: Record<string, string>,
): Promise<string> => {
  let response: Response;

  try {
    response = await fetch(url, { headers, credentials: 'omit' });
  } catch (error) {
    throw new CustomError(
      `Failed to fetch SDK client module ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      'FRONT_COMPONENT_MODULE_FETCH_FAILED',
    );
  }

  if (!response.ok) {
    throw new CustomError(
      `Failed to fetch SDK client module ${url}: ${response.status} ${response.statusText}`,
      'FRONT_COMPONENT_MODULE_FETCH_FAILED',
    );
  }

  return response.text();
};
