import { FathomError } from 'fathom-typescript/sdk/models/errors';

const FATHOM_RATE_LIMIT_FALLBACK_DELAY_MILLISECONDS = 60_000;

export const getFathomRetryAfterDelay = ({
  error,
  now,
}: {
  error: unknown;
  now: Date;
}): number | undefined => {
  if (!(error instanceof FathomError) || error.statusCode !== 429) {
    return undefined;
  }

  const retryAfter = error.headers.get('retry-after')?.trim();

  if (!retryAfter) {
    return FATHOM_RATE_LIMIT_FALLBACK_DELAY_MILLISECONDS;
  }

  const retryAfterSeconds = Number(retryAfter);
  const delayMilliseconds = Number.isNaN(retryAfterSeconds)
    ? Date.parse(retryAfter) - now.getTime()
    : retryAfterSeconds * 1_000;

  return Number.isFinite(delayMilliseconds) && delayMilliseconds >= 0
    ? delayMilliseconds
    : FATHOM_RATE_LIMIT_FALLBACK_DELAY_MILLISECONDS;
};
