import { isNull, isNumber, isString } from '@sniptt/guards';
import { type ObjectRecord } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

export const readRecordSortableValue = ({
  record,
  path,
}: {
  record: ObjectRecord;
  path: string[];
}): string | number | null | undefined => {
  let current: unknown = record;

  for (const key of path) {
    if (isNull(current)) {
      return null;
    }

    if (!isPlainObject(current)) {
      return undefined;
    }

    current = current[key];
  }

  if (isNull(current) || isString(current) || isNumber(current)) {
    return current;
  }

  return undefined;
};
