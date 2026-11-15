import { CONNECTION_AGGREGATES_GQL_FIELDS_KEY } from '@/object-record/graphql/record-gql-fields/constants/ConnectionAggregatesGqlFieldsKey';
import { addAggregatesToRecordGqlFields } from '@/object-record/record-column-aggregate/utils/addAggregatesToRecordGqlFields';
import { type RecordGqlFields } from 'twenty-shared/types';

describe('addAggregatesToRecordGqlFields', () => {
  it('adds the aggregates of each relation inside its connection selection', () => {
    expect(
      addAggregatesToRecordGqlFields({
        recordGqlFields: {
          id: true,
          people: { id: true, name: true },
          opportunities: { id: true },
        },
        aggregateColumns: [
          { relationFieldName: 'people', aggregateGqlFieldName: 'totalCount' },
          {
            relationFieldName: 'opportunities',
            aggregateGqlFieldName: 'sumAmountAmountMicros',
          },
          {
            relationFieldName: 'opportunities',
            aggregateGqlFieldName: 'maxCloseDate',
          },
        ],
      }),
    ).toEqual({
      id: true,
      people: {
        id: true,
        name: true,
        [CONNECTION_AGGREGATES_GQL_FIELDS_KEY]: { totalCount: true },
      },
      opportunities: {
        id: true,
        [CONNECTION_AGGREGATES_GQL_FIELDS_KEY]: {
          sumAmountAmountMicros: true,
          maxCloseDate: true,
        },
      },
    });
  });

  it('leaves the selection unchanged when the relation is not selected', () => {
    const recordGqlFields: RecordGqlFields = { id: true };

    expect(
      addAggregatesToRecordGqlFields({
        recordGqlFields,
        aggregateColumns: [
          { relationFieldName: 'people', aggregateGqlFieldName: 'totalCount' },
        ],
      }),
    ).toEqual(recordGqlFields);
  });
});
