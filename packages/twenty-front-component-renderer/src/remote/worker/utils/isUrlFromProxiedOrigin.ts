import { getURLSafely, isDefined } from 'twenty-shared/utils';

export const isUrlFromProxiedOrigin = (
  url: string,
  proxiedOrigins: string[],
): boolean => {
  const origin = getURLSafely(url)?.origin;

  return isDefined(origin) && proxiedOrigins.includes(origin);
};
