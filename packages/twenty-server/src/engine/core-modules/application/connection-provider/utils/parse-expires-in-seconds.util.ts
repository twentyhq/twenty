import { isNonEmptyString, isNumber } from '@sniptt/guards';

export const parseExpiresInSeconds = (expiresIn: unknown): number | null => {
  if (!isNumber(expiresIn) && !isNonEmptyString(expiresIn)) {
    return null;
  }

  const expiresInSeconds = Number(expiresIn);

  return Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
    ? expiresInSeconds
    : null;
};
