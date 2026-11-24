import { isNonEmptyString } from '@sniptt/guards';

export const extractBearerToken = (
  authorizationHeader: string | undefined,
): string | undefined => {
  if (!isNonEmptyString(authorizationHeader)) {
    return undefined;
  }

  const [scheme, token, ...otherParts] = authorizationHeader
    .trim()
    .split(/\s+/);

  if (
    scheme.toLowerCase() !== 'bearer' ||
    !isNonEmptyString(token) ||
    otherParts.length > 0
  ) {
    return undefined;
  }

  return token;
};
