import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const toOrigin = (value: string): string | undefined => {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    return url.origin.toLowerCase();
  } catch {
    return undefined;
  }
};

export const isClaimStartOriginAllowed = ({
  origin,
  allowedOrigins,
}: {
  origin: string | undefined;
  allowedOrigins: string[];
}): boolean => {
  if (!isNonEmptyString(origin)) {
    return false;
  }

  const requestOrigin = toOrigin(origin);

  if (!isDefined(requestOrigin)) {
    return false;
  }

  return allowedOrigins.some(
    (allowedOrigin) => toOrigin(allowedOrigin) === requestOrigin,
  );
};
