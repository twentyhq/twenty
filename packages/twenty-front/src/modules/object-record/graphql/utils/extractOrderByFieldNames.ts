import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

import { isOrderByDirection } from '@/object-record/graphql/utils/isOrderByDirection';

export const extractOrderByFieldNames = (
  orderBy: RecordGqlOperationOrderBy,
): Record<string, boolean | Record<string, boolean>> => {
  const gqlFields: Record<string, boolean | Record<string, boolean>> = {
    id: true,
  };

  for (const entry of orderBy) {
    for (const [fieldName, value] of Object.entries(entry)) {
      if (isOrderByDirection(value)) {
        gqlFields[fieldName] = true;
      } else if (isPlainObject(value)) {
        const subFields: Record<string, boolean> = {};

        for (const [subFieldName, subValue] of Object.entries(
          value as Record<string, unknown>,
        )) {
          if (isOrderByDirection(subValue)) {
            subFields[subFieldName] = true;
          }
        }
        gqlFields[fieldName] = subFields;
      }
    }
  }

  return gqlFields;
};
