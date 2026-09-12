import { GRANOLA_HISTORY_MAX_IMPORT_DAYS } from 'src/constants/granola-history.constant';

export const parseHistoryImportDays = (value: string): number | undefined => {
  if (!/^\d+$/.test(value.trim())) {
    return undefined;
  }

  const days = Number(value);

  return days >= 1 && days <= GRANOLA_HISTORY_MAX_IMPORT_DAYS
    ? days
    : undefined;
};
