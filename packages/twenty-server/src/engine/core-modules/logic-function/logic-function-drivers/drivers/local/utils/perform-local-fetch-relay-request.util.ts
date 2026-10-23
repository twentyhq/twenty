import { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-shared/utils';

import {
  type LocalFetchRelayRequest,
  type LocalFetchRelayResponse,
} from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/local/types/local-fetch-relay.type';

const IGNORED_REQUEST_HEADERS = new Set([
  'connection',
  'content-length',
  'host',
  'keep-alive',
  'transfer-encoding',
  'upgrade',
]);

// The body is already decompressed and re-framed by the time it reaches the handler.
const IGNORED_RESPONSE_HEADERS = new Set([
  'connection',
  'content-encoding',
  'content-length',
  'transfer-encoding',
]);

const NULL_BODY_STATUSES = new Set([101, 204, 205, 304]);

export const performLocalFetchRelayRequest = async ({
  request,
  httpClient,
  signal,
}: {
  request: LocalFetchRelayRequest;
  httpClient: AxiosInstance;
  signal?: AbortSignal;
}): Promise<LocalFetchRelayResponse> => {
  const response = await httpClient.request<ArrayBuffer>({
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(
      request.headers.filter(([name]) => !IGNORED_REQUEST_HEADERS.has(name)),
    ),
    data: isDefined(request.body)
      ? Buffer.from(request.body, 'base64')
      : undefined,
    responseType: 'arraybuffer',
    validateStatus: () => true,
    signal,
    ...(request.redirect === 'follow' ? {} : { maxRedirects: 0 }),
  });

  const headers: [string, string][] = [];

  for (const [name, value] of Object.entries(response.headers)) {
    if (IGNORED_RESPONSE_HEADERS.has(name) || !isDefined(value)) {
      continue;
    }

    for (const headerValue of Array.isArray(value) ? value : [value]) {
      headers.push([name, String(headerValue)]);
    }
  }

  return {
    status: response.status,
    statusText: response.statusText,
    headers,
    body: NULL_BODY_STATUSES.has(response.status)
      ? undefined
      : Buffer.from(response.data).toString('base64'),
  };
};
