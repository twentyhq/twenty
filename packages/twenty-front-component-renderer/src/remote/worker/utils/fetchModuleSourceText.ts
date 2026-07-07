import { CustomError } from 'twenty-shared/utils';

export const fetchModuleSourceText = async (
  url: string,
  headers?: Record<string, string>,
): Promise<string> => {
  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new CustomError(
      `Failed to fetch front component module ${url}: ${response.status} ${response.statusText}`,
      'FRONT_COMPONENT_MODULE_FETCH_FAILED',
    );
  }

  return response.text();
};
