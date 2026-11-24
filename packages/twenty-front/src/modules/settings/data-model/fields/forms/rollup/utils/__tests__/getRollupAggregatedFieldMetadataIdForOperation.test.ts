import { getRollupAggregatedFieldMetadataIdForOperation } from '@/settings/data-model/fields/forms/rollup/utils/getRollupAggregatedFieldMetadataIdForOperation';
import { AggregateOperations, FieldMetadataType } from 'twenty-shared/types';

const RELATED_FIELDS = [
  {
    id: 'closeDate',
    type: FieldMetadataType.DATE_TIME,
    isActive: true,
    isSystem: false,
    settings: null,
  },
  {
    id: 'amount',
    type: FieldMetadataType.NUMBER,
    isActive: true,
    isSystem: false,
    settings: null,
  },
];

describe('getRollupAggregatedFieldMetadataIdForOperation', () => {
  it('should clear the field for COUNT', () => {
    expect(
      getRollupAggregatedFieldMetadataIdForOperation({
        aggregateOperation: AggregateOperations.COUNT,
        currentAggregatedFieldMetadataId: 'amount',
        relatedFieldMetadataItems: RELATED_FIELDS,
      }),
    ).toBeNull();
  });

  it('should keep the current field when it still supports the operation', () => {
    expect(
      getRollupAggregatedFieldMetadataIdForOperation({
        aggregateOperation: AggregateOperations.MAX,
        currentAggregatedFieldMetadataId: 'amount',
        relatedFieldMetadataItems: RELATED_FIELDS,
      }),
    ).toBe('amount');
  });

  it('should fall back to the first field supporting the operation', () => {
    expect(
      getRollupAggregatedFieldMetadataIdForOperation({
        aggregateOperation: AggregateOperations.SUM,
        currentAggregatedFieldMetadataId: 'closeDate',
        relatedFieldMetadataItems: RELATED_FIELDS,
      }),
    ).toBe('amount');
  });
});
