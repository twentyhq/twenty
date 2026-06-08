import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

import { isOrderByDirection } from '@/object-record/record-show/utils/isOrderByDirection.util';

export type ResolvedOrderByField = {
  fieldName: string;
  direction: string;
  subFieldName?: string;
};

export const resolveOrderByFields = (
  orderBy: RecordGqlOperationOrderBy,
): ResolvedOrderByField[] => {
  const fields: ResolvedOrderByField[] = [];

  for (const entry of orderBy) {
    for (const [fieldName, value] of Object.entries(entry)) {
      if (isOrderByDirection(value)) {
        fields.push({ fieldName, direction: value });
      } else if (typeof value === 'object' && value !== null) {
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
