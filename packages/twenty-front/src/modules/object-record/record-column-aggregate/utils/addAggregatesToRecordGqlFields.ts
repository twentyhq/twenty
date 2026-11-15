import { CONNECTION_AGGREGATES_GQL_FIELDS_KEY } from '@/object-record/graphql/record-gql-fields/constants/ConnectionAggregatesGqlFieldsKey';
import { type AggregateColumn } from '@/object-record/record-column-aggregate/utils/getAggregateColumns';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

export const addAggregatesToRecordGqlFields = ({
  recordGqlFields,
  aggregateColumns,
}: {
  recordGqlFields: RecordGqlFields;
  aggregateColumns: AggregateColumn[];
}) =>
  aggregateColumns.reduce<RecordGqlFields>(
    (gqlFields, { relationFieldName, aggregateGqlFieldName }) => {
      const relationGqlFields = gqlFields[relationFieldName];

      if (!isPlainObject(relationGqlFields)) {
        return gqlFields;
      }

      const connectionAggregatesGqlFields =
        relationGqlFields[CONNECTION_AGGREGATES_GQL_FIELDS_KEY];

      return {
        ...gqlFields,
        [relationFieldName]: {
          ...relationGqlFields,
          [CONNECTION_AGGREGATES_GQL_FIELDS_KEY]: {
            ...(isPlainObject(connectionAggregatesGqlFields)
              ? connectionAggregatesGqlFields
              : {}),
            [aggregateGqlFieldName]: true,
          },
        },
      };
    },
    recordGqlFields,
  );
