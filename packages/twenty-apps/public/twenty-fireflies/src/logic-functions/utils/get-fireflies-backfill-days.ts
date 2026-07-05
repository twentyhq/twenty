import { isNonEmptyString } from '@sniptt/guards';

import { DEFAULT_FIREFLIES_BACKFILL_DAYS } from 'src/logic-functions/constants/default-fireflies-backfill-days';
import { FIREFLIES_BACKFILL_DAYS_ENV_VAR_NAME } from 'src/logic-functions/constants/fireflies-backfill-days-env-var-name';

// Zero (or a negative value) disables the automatic history backfill; an
// unset or unparseable value falls back to the default window.
export const getFirefliesBackfillDays = (): number => {
  const rawValue = process.env[FIREFLIES_BACKFILL_DAYS_ENV_VAR_NAME]?.trim();

  if (!isNonEmptyString(rawValue)) {
    return DEFAULT_FIREFLIES_BACKFILL_DAYS;
  }

  const parsedValue = Number(rawValue);

  if (!Number.isFinite(parsedValue)) {
    return DEFAULT_FIREFLIES_BACKFILL_DAYS;
  }

  return Math.floor(parsedValue);
};
