import { FIREFLIES_BACKFILL_MAX_WINDOW_DAYS } from 'src/constants/fireflies-backfill-max-window-days.constant';

export const parseBackfillDays = (rawValue: string): number | undefined => {
  const parsedValue = Number(rawValue);

  if (
    !Number.isInteger(parsedValue) ||
    parsedValue <= 0 ||
    parsedValue > FIREFLIES_BACKFILL_MAX_WINDOW_DAYS
  ) {
    return undefined;
  }

  return parsedValue;
};
