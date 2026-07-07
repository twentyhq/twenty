import { type HostFetchResult } from '@/types/HostFetchResult';

export const serializeResponseToHostFetchResult = async (
  response: Response,
): Promise<HostFetchResult> => {
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
