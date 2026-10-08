import { isNonEmptyString } from '@sniptt/guards';

export const parseRetryAfterHeaderMilliseconds = (
  retryAfter: string | null,
): number | undefined => {
  if (!isNonEmptyString(retryAfter)) {
    return undefined;
  }

  if (Number.isFinite(Number(retryAfter))) {
    return Math.max(0, Number(retryAfter) * 1_000);
  }

  const delayMilliseconds = Date.parse(retryAfter) - Date.now();

  return Number.isFinite(delayMilliseconds)
    ? Math.max(0, delayMilliseconds)
    : undefined;
};
