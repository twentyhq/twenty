import { isNonEmptyString } from '@sniptt/guards';

export const getTimestamp = (
  dateTime: string | null | undefined,
): number | undefined => {
  if (!isNonEmptyString(dateTime)) {
    return undefined;
  }

  const timestamp = new Date(dateTime).getTime();

  return Number.isNaN(timestamp) ? undefined : timestamp;
};
