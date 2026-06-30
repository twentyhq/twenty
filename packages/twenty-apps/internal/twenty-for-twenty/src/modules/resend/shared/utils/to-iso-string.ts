import { isDefined } from '@utils/is-defined';

export const toIsoString = (date: string): string =>
  new Date(date).toISOString();

export const toIsoStringOrNull = (
  date: string | null | undefined,
): string | null => (isDefined(date) ? toIsoString(date) : null);
