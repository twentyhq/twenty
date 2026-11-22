import { isNonEmptyString } from '@sniptt/guards';

export const parseRetryAfterMs = (
  retryAfter: string | null | undefined,
): number | undefined => {
  if (!isNonEmptyString(retryAfter)) {
    return undefined;
  }

  const retryAfterSeconds = Number(retryAfter);

  if (Number.isFinite(retryAfterSeconds)) {
    return Math.max(retryAfterSeconds * 1_000, 0);
  }

  const retryAtMs = Date.parse(retryAfter);

  return Number.isNaN(retryAtMs)
    ? undefined
    : Math.max(retryAtMs - Date.now(), 0);
};
