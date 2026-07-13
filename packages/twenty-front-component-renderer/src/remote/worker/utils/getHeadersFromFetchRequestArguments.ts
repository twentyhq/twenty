import { isDefined } from 'twenty-shared/utils';

import { isRequestObject } from '@/remote/worker/utils/isRequestObject';

const toHeaderRecord = (headers: HeadersInit): Record<string, string> => {
  const record: Record<string, string> = {};

  new Headers(headers).forEach((value, key) => {
    record[key] = value;
  });

  return record;
};

export const getHeadersFromFetchRequestArguments = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Record<string, string> => {
  if (isDefined(init?.headers)) {
    return toHeaderRecord(init.headers);
  }

  if (isRequestObject(input)) {
    return toHeaderRecord(input.headers);
  }

  return {};
};
