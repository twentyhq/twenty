import { isDefined } from 'twenty-shared/utils';

export const toIsoString = (date: string): string =>
  new Date(date).toISOString();

export const toIsoStringOrNull = (
  date: string | null | undefined,
): string | null => (isDefined(date) ? toIsoString(date) : null);
