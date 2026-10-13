import { isNonEmptyString } from '@sniptt/guards';
import { FathomError } from 'fathom-typescript/sdk/models/errors';

import { FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS } from 'src/constants/fathom.constant';

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

  if (!isNonEmptyString(retryAfter)) {
    return FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS;
  }

  const retryAfterSeconds = Number(retryAfter);
  const delayMilliseconds = Number.isNaN(retryAfterSeconds)
    ? Date.parse(retryAfter) - now.getTime()
    : retryAfterSeconds * 1_000;

  return Number.isFinite(delayMilliseconds) && delayMilliseconds >= 0
    ? delayMilliseconds
    : FATHOM_RETRY_FALLBACK_DELAY_MILLISECONDS;
};
