import { isString } from '@sniptt/guards';

export const getUrlFromFetchRequestInput = (
  input: string | URL | Pick<Request, 'url'>,
): string => {
  if (isString(input)) {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return input.url;
};
