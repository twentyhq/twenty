import { isNonEmptyString, isObject } from '@sniptt/guards';

import { LINE_API_BASE_URL } from 'src/constants/line-api.constant';
import { LineApiError } from 'src/logic-functions/data/line-api.error';

const parseResponseBody = (text: string): unknown => {
  if (!isNonEmptyString(text)) {
    return undefined;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const getErrorMessage = (body: unknown): string | undefined =>
  isObject(body) &&
  'message' in body &&
  isNonEmptyString(body.message)
    ? body.message
    : undefined;

export const lineApiRequest = async <TResponse>({
  accessToken,
  method,
  path,
  data,
  headers,
  isExpectedResponse,
}: {
  accessToken: string;
  method: 'GET' | 'POST';
  path: string;
  data?: unknown;
  headers?: Record<string, string>;
  isExpectedResponse: (body: unknown) => body is TResponse;
}): Promise<TResponse> => {
  const response = await fetch(`${LINE_API_BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(data === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: data === undefined ? undefined : JSON.stringify(data),
  });
  const body = parseResponseBody(await response.text());

  if (!response.ok) {
    throw new LineApiError(
      `LINE API error ${response.status} on ${method} ${path}: ${getErrorMessage(body) ?? response.statusText}`,
      response.status,
      body,
    );
  }

  if (!isExpectedResponse(body)) {
    throw new LineApiError(
      `LINE API returned an unexpected response on ${method} ${path}`,
      response.status,
      body,
    );
  }

  return body;
};
