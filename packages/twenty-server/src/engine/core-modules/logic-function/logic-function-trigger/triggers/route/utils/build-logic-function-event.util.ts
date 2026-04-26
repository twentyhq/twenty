import { type RawBodyRequest } from '@nestjs/common';
import { type Request } from 'express';
import { type LogicFunctionEvent } from 'twenty-shared/types';

/**
 * Filters HTTP headers from Express request based on allowed header names
 * Header names are case-insensitive as per HTTP specification
 */
export const filterRequestHeaders = ({
  requestHeaders,
  forwardedRequestHeaders,
}: {
  requestHeaders: Request['headers'];
  forwardedRequestHeaders: string[];
}): Record<string, string | undefined> => {
  const lowercaseForwardedHeaders = forwardedRequestHeaders.map((h) =>
    h.toLowerCase(),
  );

  const filteredHeaders: Record<string, string | undefined> = {};

  for (const headerName of lowercaseForwardedHeaders) {
    const headerValue = requestHeaders[headerName];

    if (headerValue !== undefined) {
      filteredHeaders[headerName] = Array.isArray(headerValue)
        ? headerValue.join(', ')
        : headerValue;
    }
  }

  return filteredHeaders;
};

/**
 * Extracts the original raw request body as a UTF-8 string, before any JSON
 * parsing. NestJS preserves it on `request.rawBody` because the app is
 * bootstrapped with `rawBody: true` (see main.ts).
 *
 * Returns undefined when no raw body is available (e.g. empty body, or
 * unrelated request types). Logic functions that need to verify HMAC-style
 * signatures (GitHub's `X-Hub-Signature-256`, Stripe, …) read this off the
 * `LogicFunctionEvent` instead of trying to re-serialize the parsed body.
 */
export const extractRawBody = (request: Request): string | undefined => {
  const rawBody = (request as RawBodyRequest<Request>).rawBody;

  if (!rawBody || rawBody.length === 0) {
    return undefined;
  }

  return rawBody.toString('utf-8');
};

/**
 * Extracts the body from Express request as an object
 * Express body-parser middleware parses JSON bodies automatically
 * Returns null if body is empty/undefined
 */
export const extractBody = (request: Request): object | null => {
  if (request.body === undefined || request.body === null) {
    return null;
  }

  if (typeof request.body === 'object' && !Buffer.isBuffer(request.body)) {
    return request.body;
  }

  if (typeof request.body === 'string') {
    try {
      return JSON.parse(request.body);
    } catch {
      return { raw: request.body };
    }
  }

  if (Buffer.isBuffer(request.body)) {
    try {
      return JSON.parse(request.body.toString('utf-8'));
    } catch {
      return { raw: request.body.toString('utf-8') };
    }
  }

  return { raw: String(request.body) };
};

/**
 * Converts Express query parameters to a normalized string format
 * Arrays are joined with commas (e.g., ['1', '2', '3'] → '1,2,3')
 */
export const normalizeQueryStringParameters = (
  query: Request['query'],
): Record<string, string | undefined> => {
  const normalized: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      const stringValues = value.filter(
        (v): v is string => typeof v === 'string',
      );

      normalized[key] = stringValues.join(',');
    } else if (typeof value === 'string') {
      normalized[key] = value;
    } else if (typeof value === 'object') {
      normalized[key] = JSON.stringify(value);
    }
  }

  return normalized;
};

/**
 * Normalizes path parameters to string format
 * Arrays are joined with commas (e.g., ['1', '2', '3'] → '1,2,3')
 */
export const normalizePathParameters = (
  pathParams: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> => {
  const normalized: Record<string, string | undefined> = {};

  for (const [key, value] of Object.entries(pathParams)) {
    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      normalized[key] = value.join(',');
    } else {
      normalized[key] = value;
    }
  }

  return normalized;
};

/**
 * Builds an AWS HTTP API v2 compatible event from an Express request
 * @see https://docs.aws.amazon.com/apigateway/latest/developerguide/http-api-develop-integrations-lambda.html
 */
export const buildLogicFunctionEvent = ({
  request,
  pathParameters,
  forwardedRequestHeaders,
}: {
  request: Request;
  pathParameters: Record<string, string | string[] | undefined>;
  forwardedRequestHeaders: string[];
}): LogicFunctionEvent => {
  const rawBody = extractRawBody(request);

  return {
    headers: filterRequestHeaders({
      requestHeaders: request.headers,
      forwardedRequestHeaders,
    }),
    queryStringParameters: normalizeQueryStringParameters(request.query),
    pathParameters: normalizePathParameters(pathParameters),
    body: extractBody(request),
    ...(rawBody !== undefined ? { rawBody } : {}),
    isBase64Encoded: false,
    requestContext: {
      http: {
        method: request.method,
        path: request.path,
      },
    },
  };
};
