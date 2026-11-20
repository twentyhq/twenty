import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';
import { isString } from '@sniptt/guards';

import { type ObjectRecordFilter } from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';

export const getRecordIdsTargetedByFilter = (
  filter: Partial<ObjectRecordFilter>,
): string[] | undefined => {
  const filterKeys = Object.keys(filter);

  if (filterKeys.length !== 1 || filterKeys[0] !== 'id') {
    return undefined;
  }

  const idFilter: unknown = filter.id;

  if (!isPlainObject(idFilter) || Object.keys(idFilter).length !== 1) {
    return undefined;
  }

  if (isString(idFilter.eq)) {
    return [idFilter.eq];
  }

  if (
    Array.isArray(idFilter.in) &&
    isNonEmptyArray(idFilter.in) &&
    idFilter.in.every(isString)
  ) {
    return [...idFilter.in];
  }

  return undefined;
};
