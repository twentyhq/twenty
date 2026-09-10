import { isNonEmptyString } from './is-non-empty-string.util';

const getTokenFromAuthorizationHeader = (
  authorizationHeader: string | null | undefined,
): string | null => {
  if (!isNonEmptyString(authorizationHeader)) {
    return null;
  }

  const trimmedAuthorizationHeader = authorizationHeader.trim();

  if (
    trimmedAuthorizationHeader.length === 0 ||
    trimmedAuthorizationHeader === 'Bearer'
  ) {
    return null;
  }

  return trimmedAuthorizationHeader.startsWith('Bearer ')
    ? trimmedAuthorizationHeader.slice('Bearer '.length).trim()
    : trimmedAuthorizationHeader;
};

export const getTokenFromHeaders = (
  headers: HeadersInit | undefined,
): string | null => {
  if (headers === undefined) {
    return null;
  }

  return getTokenFromAuthorizationHeader(
    new Headers(headers).get('Authorization'),
  );
};
