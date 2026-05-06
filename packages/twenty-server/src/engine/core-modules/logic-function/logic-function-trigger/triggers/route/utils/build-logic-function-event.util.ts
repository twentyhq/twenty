import { type RawBodyRequest } from '@nestjs/common';
import { type Request } from 'express';
import { type LogicFunctionEvent } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

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

export const extractRawBody = (request: Request): string | undefined => {
  const rawBody = (request as RawBodyRequest<Request>).rawBody;

  if (!isDefined(rawBody)) {
    return undefined;
  }

  return rawBody.toString('utf-8');
};

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

export const buildLogicFunctionEvent = ({
  request,
  pathParameters,
  forwardedRequestHeaders,
  userWorkspaceId,
}: {
  request: Request;
  pathParameters: Record<string, string | string[] | undefined>;
  forwardedRequestHeaders: string[];
  userWorkspaceId: string | null;
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
    ...(isDefined(rawBody) ? { rawBody } : {}),
    isBase64Encoded: false,
    requestContext: {
      http: {
        method: request.method,
        path: request.path,
      },
    },
    userWorkspaceId,
  };
};
