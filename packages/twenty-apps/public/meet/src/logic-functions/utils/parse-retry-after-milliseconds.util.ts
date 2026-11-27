import { isNonEmptyString } from '@sniptt/guards';

export const parseRetryAfterMilliseconds = ({
  retryAfter,
  now,
}: {
  retryAfter: string | null;
  now: Date;
}): number | undefined => {
  if (!isNonEmptyString(retryAfter)) {
    return undefined;
  }

  const seconds = Number(retryAfter);

  if (Number.isFinite(seconds)) {
    return seconds > 0 ? seconds * 1_000 : undefined;
  }

  const retryAt = Date.parse(retryAfter);

  if (Number.isNaN(retryAt) || retryAt <= now.getTime()) {
    return undefined;
  }

  return retryAt - now.getTime();
};
