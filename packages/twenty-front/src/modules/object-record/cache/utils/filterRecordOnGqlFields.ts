import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyArray } from '@apollo/client/utilities';
import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
export const filterRecordOnGqlFields = ({
  record,
  recordGqlFields,
}: {
  record: ObjectRecord;
  recordGqlFields: RecordGqlFields;
}): Partial<ObjectRecord> => {
  return Object.fromEntries(
    Object.entries(record)
      .map(([key, value]) => {
        const gqlFieldValue = recordGqlFields[key];

        if (!isDefined(gqlFieldValue) || gqlFieldValue === false) {
          return undefined;
        }

        if (gqlFieldValue === true) {
          return [key, value];
        }

        if (isNonEmptyArray(value)) {
          return [
            key,
            value.map((item) => {
              if (!isDefined(item) || typeof item !== 'object') {
                return item;
              }

              return filterRecordOnGqlFields({
                record: item as ObjectRecord,
                recordGqlFields: gqlFieldValue,
              });
            }),
          ];
        }

        if (isObject(value)) {
          return [
            key,
            filterRecordOnGqlFields({
              record: value as ObjectRecord,
              recordGqlFields: gqlFieldValue,
            }),
          ];
        }

        return [key, value];
      })
      .filter(isDefined),
  ) as Partial<ObjectRecord>;
};
