import { getURLSafely, isDefined } from 'twenty-shared/utils';

export const getUniqueHttpOriginsFromUrls = (
  urls: (string | undefined)[],
): string[] => [
  ...new Set(
    urls
      .filter(isDefined)
      .map((url) => getURLSafely(url))
      .filter(isDefined)
      .filter((url) => url.protocol === 'http:' || url.protocol === 'https:')
      .map((url) => url.origin),
  ),
];
