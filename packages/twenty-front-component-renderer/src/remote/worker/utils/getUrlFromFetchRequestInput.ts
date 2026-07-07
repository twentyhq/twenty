export const getUrlFromFetchRequestInput = (
  input: RequestInfo | URL,
): string => {
  if (typeof input === 'string') {
    return input;
  }

  if (input instanceof URL) {
    return input.href;
  }

  return input.url;
};
