import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { isOrderByDirection } from '@/object-record/graphql/utils/isOrderByDirection';

export type CursorOrderByField = {
  fieldName: string;
  direction: string;
  subFieldName?: string;
};

export const resolveCursorOrderByFields = (
  orderBy: RecordGqlOperationOrderBy,
): CursorOrderByField[] => {
  const fields: CursorOrderByField[] = [];

  for (const entry of orderBy) {
    for (const [fieldName, value] of Object.entries(entry)) {
      if (isOrderByDirection(value)) {
        fields.push({ fieldName, direction: value });
      } else if (isPlainObject(value)) {
        for (const [subFieldName, subValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          if (isOrderByDirection(subValue)) {
            fields.push({ fieldName, direction: subValue, subFieldName });
          }
        }
      }
    }
  }

  if (!fields.some((field) => field.fieldName === 'id')) {
    fields.push({ fieldName: 'id', direction: 'AscNullsFirst' });
  }

  return fields;
};
