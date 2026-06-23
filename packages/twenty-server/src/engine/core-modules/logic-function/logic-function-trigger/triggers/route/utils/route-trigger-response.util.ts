import { type Response } from 'express';
import { isLogicFunctionHttpResponse } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type RouteTriggerResponse = {
  statusCode: number;
  headers: Record<string, string>;
  body: unknown;
};

const ALLOWED_RESPONSE_HEADERS = new Set([
  'content-type',
  'content-language',
  'content-disposition',
  'cache-control',
  'retry-after',
]);

export const buildRouteTriggerResponse = (
  data: unknown,
): RouteTriggerResponse => {
  if (isLogicFunctionHttpResponse(data)) {
    return {
      statusCode: data.status ?? 200,
      headers: data.headers ?? {},
      body: data.body,
    };
  }

  return { statusCode: 200, headers: {}, body: data };
};

export const sendRouteTriggerResponse = (
  response: Response,
  { statusCode, headers, body }: RouteTriggerResponse,
  { allowAllHeaders = false }: { allowAllHeaders?: boolean } = {},
) => {
  response.status(statusCode);

  // On an isolated public domain the response cannot reach the main app's
  // origin, so functions may return arbitrary headers (custom headers,
  // Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Embedder-Policy,
  // Set-Cookie, ...). On the same-site /s/ route we keep the strict allow-list.
  for (const [key, value] of Object.entries(headers)) {
    if (allowAllHeaders || ALLOWED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      response.setHeader(key, value);
    }
  }

  if (!isDefined(body)) {
    response.send();

    return;
  }

  const hasContentType = isDefined(response.getHeader('content-type'));

  if (typeof body === 'string') {
    if (!hasContentType) {
      response.setHeader('content-type', 'text/plain');
    }

    response.send(body);

    return;
  }

  if (hasContentType) {
    response.send(JSON.stringify(body));

    return;
  }

  response.json(body);
};
