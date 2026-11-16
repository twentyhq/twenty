import { CONNECTION_AGGREGATES_GQL_FIELDS_KEY } from '@/object-record/graphql/record-gql-fields/constants/ConnectionAggregatesGqlFieldsKey';
import { addAggregatesToRecordGqlFields } from '@/object-record/record-column-aggregate/utils/addAggregatesToRecordGqlFields';

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

  it('selects only the ids of related records when the relation is shown only through aggregates', () => {
    expect(
      addAggregatesToRecordGqlFields({
        recordGqlFields: { id: true },
        aggregateColumns: [
          { relationFieldName: 'people', aggregateGqlFieldName: 'totalCount' },
          {
            relationFieldName: 'people',
            aggregateGqlFieldName: 'countNotEmptyEmails',
          },
        ],
      }),
    ).toEqual({
      id: true,
      people: {
        id: true,
        [CONNECTION_AGGREGATES_GQL_FIELDS_KEY]: {
          totalCount: true,
          countNotEmptyEmails: true,
        },
      },
    });
  });
});
