import { isNonEmptyString } from '@sniptt/guards';

export const extractBearerToken = (
  authorizationHeader: string | undefined,
): string | undefined => {
  if (!isNonEmptyString(authorizationHeader)) {
    return undefined;
  }

  const headerParts = authorizationHeader.trim().split(/\s+/);

  if (headerParts.length !== 2 || headerParts[0].toLowerCase() !== 'bearer') {
    return undefined;
  }

  return headerParts[1];
};
