import {
  BACKFILL_BATCH_SIZE_ENV_VAR_NAME,
  BACKFILL_SLEEP_MS_ENV_VAR_NAME,
  DEFAULT_BACKFILL_BATCH_SIZE,
  DEFAULT_BACKFILL_SLEEP_MS,
} from 'src/constants/backfill';

// Application and server variables are injected into process.env on every
// execution.
const readPositiveInteger = (
  envVarName: string,
  fallback: number,
): number => {
  const rawValue = process.env[envVarName];

  if (rawValue === undefined || rawValue.trim().length === 0) {
    return fallback;
  }

  const parsedValue = Number(rawValue);

  return Number.isInteger(parsedValue) && parsedValue > 0
    ? parsedValue
    : fallback;
};

export const getBackfillBatchSize = (): number =>
  readPositiveInteger(BACKFILL_BATCH_SIZE_ENV_VAR_NAME, DEFAULT_BACKFILL_BATCH_SIZE);

export const getBackfillSleepMs = (): number =>
  readPositiveInteger(BACKFILL_SLEEP_MS_ENV_VAR_NAME, DEFAULT_BACKFILL_SLEEP_MS);
