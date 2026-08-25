import { isDefined } from 'twenty-shared/utils';

export const getRecordArrayField = <TItem>(
  record: object | null | undefined,
  fieldName: string,
): TItem[] => {
  if (!isDefined(record)) {
    return [];
  }

  const value = (record as Record<string, unknown>)[fieldName];

  return Array.isArray(value) ? value : [];
};
