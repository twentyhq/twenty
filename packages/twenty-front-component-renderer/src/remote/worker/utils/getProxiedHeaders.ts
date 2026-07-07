import { isDefined } from 'twenty-shared/utils';

import { isRequestInput } from '@/remote/worker/utils/isRequestInput';

const toHeaderRecord = (headers: HeadersInit): Record<string, string> => {
  const record: Record<string, string> = {};

  new Headers(headers).forEach((value, key) => {
    record[key] = value;
  });

  return record;
};

export const getProxiedHeaders = (
  input: RequestInfo | URL,
  init: RequestInit | undefined,
): Record<string, string> => {
  if (isDefined(init?.headers)) {
    return toHeaderRecord(init.headers);
  }

  if (isRequestInput(input)) {
    return toHeaderRecord(input.headers);
  }

  return {};
};
