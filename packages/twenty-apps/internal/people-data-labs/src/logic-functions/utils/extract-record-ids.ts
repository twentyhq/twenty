import { isNonEmptyString } from '@sniptt/guards';

export const extractRecordIds = (
  records: Array<string | { id?: string | null }>,
): string[] => {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map((record) => (typeof record === 'string' ? record : record?.id))
    .filter((id): id is string => isNonEmptyString(id));
};
