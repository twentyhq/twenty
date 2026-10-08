import { isDefined } from 'twenty-shared/utils';

const SAFE_RESPONSE_HEADERS = [
  'content-type',
  'retry-after',
  'x-request-id',
  'x-ratelimit-limit',
  'x-ratelimit-remaining',
  'x-ratelimit-reset',
];

export const pickSafeResponseHeaders = (headers: Headers) =>
  Object.fromEntries(
    SAFE_RESPONSE_HEADERS.flatMap((headerName) => {
      const value = headers.get(headerName);

      return isDefined(value) ? [[headerName, value]] : [];
    }),
  );
