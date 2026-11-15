import { type LookupColumn } from '@/object-record/record-column-lookup/utils/getLookupColumns';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

export const addLookupTargetsToRecordGqlFields = ({
  recordGqlFields,
  lookupColumns,
}: {
  recordGqlFields: RecordGqlFields;
  lookupColumns: LookupColumn[];
}) =>
  lookupColumns.reduce<RecordGqlFields>(
    (gqlFields, { relationFieldName, lookupTargetFieldName }) => {
      const relationGqlFields = gqlFields[relationFieldName];

      if (!isPlainObject(relationGqlFields)) {
        return gqlFields;
      }

      return {
        ...gqlFields,
        [relationFieldName]: {
          ...relationGqlFields,
          [lookupTargetFieldName]: true,
        },
      };
    },
    recordGqlFields,
  );
