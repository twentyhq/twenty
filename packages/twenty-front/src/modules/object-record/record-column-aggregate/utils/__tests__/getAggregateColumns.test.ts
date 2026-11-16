import { getAggregateColumns } from '@/object-record/record-column-aggregate/utils/getAggregateColumns';
import { getRecordFieldAggregateTarget } from '@/object-record/record-column-aggregate/utils/getRecordFieldAggregateTarget';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { isDefined } from 'twenty-shared/utils';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const peopleField = getMockFieldMetadataItemOrThrow({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  fieldName: 'people',
});

describe('getAggregateColumns', () => {
  it('lists the relation and aggregate field of each aggregate column only', () => {
    expect(
      getAggregateColumns({
        recordFields: [{ id: 'plain' }, { id: 'count' }, { id: 'unknown' }],
        columnDescriptorByRecordFieldId: {
          plain: { aggregateTarget: undefined },
          count: {
            aggregateTarget: getRecordFieldAggregateTarget({
              recordField: {
                relationAggregateOperation: AggregateOperations.COUNT,
              },
              fieldMetadataItem: peopleField,
              objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
            }),
          },
        },
      }),
    ).toEqual([
      { relationFieldName: 'people', aggregateGqlFieldName: 'totalCount' },
    ]);
  });

  it('leaves out an aggregate of a field the user cannot read', () => {
    const aggregateTarget = getRecordFieldAggregateTarget({
      recordField: { relationAggregateOperation: AggregateOperations.COUNT },
      fieldMetadataItem: peopleField,
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
    });

    expect(
      getAggregateColumns({
        recordFields: [{ id: 'count' }],
        columnDescriptorByRecordFieldId: {
          count: {
            aggregateTarget: isDefined(aggregateTarget)
              ? { ...aggregateTarget, isAggregatedFieldReadable: false }
              : undefined,
          },
        },
      }),
    ).toEqual([]);
  });
});
