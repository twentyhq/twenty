import { CustomError } from 'twenty-shared/utils';

import { MAX_HOST_FETCH_RESPONSE_BODY_BYTES } from '@/host/constants/MaxHostFetchResponseBodyBytes';
import { type HostFetchResult } from '@/types/HostFetchResult';

const responseTooLargeError = (): CustomError =>
  new CustomError(
    `Front component host fetch response exceeds the ${MAX_HOST_FETCH_RESPONSE_BODY_BYTES} bytes limit`,
    'FRONT_COMPONENT_HOST_FETCH_RESPONSE_TOO_LARGE',
  );

export const serializeResponseToHostFetchResult = async (
  response: Response,
): Promise<HostFetchResult> => {
  const contentLength = Number(response.headers.get('content-length') ?? 0);

  if (contentLength > MAX_HOST_FETCH_RESPONSE_BODY_BYTES) {
    throw responseTooLargeError();
  }

  const body = await response.text();

  if (new Blob([body]).size > MAX_HOST_FETCH_RESPONSE_BODY_BYTES) {
    throw responseTooLargeError();
  }

  const responseHeaders: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });

  return {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
    body,
  };
};
