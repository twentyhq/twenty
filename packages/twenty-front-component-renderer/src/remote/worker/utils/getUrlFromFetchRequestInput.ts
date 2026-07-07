import { isString } from '@sniptt/guards';

export const getUrlFromFetchRequestInput = (
  input: RequestInfo | URL,
): string => {
  if (isString(input)) {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return input.url;
};
