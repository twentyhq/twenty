import { CustomError } from 'twenty-shared/utils';

export const fetchJavaScriptModuleSourceText = async (
  url: string,
  headers?: Record<string, string>,
): Promise<string> => {
  let response: Response;

  try {
    response = await fetch(url, { headers });
  } catch (error) {
    throw new CustomError(
      `Failed to fetch front component module ${url}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      'FRONT_COMPONENT_MODULE_FETCH_FAILED',
    );
  }

  if (!response.ok) {
    throw new CustomError(
      `Failed to fetch front component module ${url}: ${response.status} ${response.statusText}`,
      'FRONT_COMPONENT_MODULE_FETCH_FAILED',
    );
  }

  return response.text();
};
