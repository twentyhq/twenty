import { CONNECTION_AGGREGATES_GQL_FIELDS_KEY } from '@/object-record/graphql/record-gql-fields/constants/ConnectionAggregatesGqlFieldsKey';
import { type AggregateColumn } from '@/object-record/record-column-aggregate/utils/getAggregateColumns';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

// A relation selected only for its aggregates fetches just the ids of its records
export const addAggregatesToRecordGqlFields = ({
  recordGqlFields,
  aggregateColumns,
}: {
  recordGqlFields: RecordGqlFields;
  aggregateColumns: Pick<
    AggregateColumn,
    'relationFieldName' | 'aggregateGqlFieldName'
  >[];
}) =>
  aggregateColumns.reduce<RecordGqlFields>(
    (gqlFields, { relationFieldName, aggregateGqlFieldName }) => {
      const relationGqlFields = gqlFields[relationFieldName];
      const selectedRelationGqlFields: RecordGqlFields = isPlainObject(
        relationGqlFields,
      )
        ? relationGqlFields
        : { id: true };

      const connectionAggregatesGqlFields =
        selectedRelationGqlFields[CONNECTION_AGGREGATES_GQL_FIELDS_KEY];

      return {
        ...gqlFields,
        [relationFieldName]: {
          ...selectedRelationGqlFields,
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
