import { isDefined } from 'twenty-shared/utils';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const withSoftDeleted = <T extends ObjectRecordFilter>(
  filter: T | undefined | null,
): boolean => {
  if (!isDefined(filter)) {
    return false;
  }

  if (Array.isArray(filter)) {
    return filter.some((item) => withSoftDeleted(item));
  }

  for (const [key, value] of Object.entries(filter)) {
    if (key === 'deletedAt') {
      return true;
    }

    if (typeof value === 'object' && value !== null) {
      if (withSoftDeleted(value)) {
        return true;
      }
    }
  }

  return false;
};
