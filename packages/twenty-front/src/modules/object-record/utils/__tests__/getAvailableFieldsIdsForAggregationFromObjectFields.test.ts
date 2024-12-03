import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { FieldMetadataType } from '~/generated/graphql';

const AMOUNT_FIELD_ID = '7d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0a';
const PRICE_FIELD_ID = '9d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0b';
const NAME_FIELD_ID = '5d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0c';

describe('getAvailableFieldsIdsForAggregationFromObjectFields', () => {
  const mockFields = [
    { id: AMOUNT_FIELD_ID, type: FieldMetadataType.Number, name: 'amount' },
    { id: PRICE_FIELD_ID, type: FieldMetadataType.Currency, name: 'price' },
    { id: NAME_FIELD_ID, type: FieldMetadataType.Text, name: 'name' },
  ];

  it('should correctly map fields to available aggregate operations', () => {
    const result = getAvailableFieldsIdsForAggregationFromObjectFields(
      mockFields as FieldMetadataItem[],
    );

    expect(result[AGGREGATE_OPERATIONS.sum]).toEqual([
      AMOUNT_FIELD_ID,
      PRICE_FIELD_ID,
    ]);
    expect(result[AGGREGATE_OPERATIONS.avg]).toEqual([
      AMOUNT_FIELD_ID,
      PRICE_FIELD_ID,
    ]);
    expect(result[AGGREGATE_OPERATIONS.min]).toEqual([
      AMOUNT_FIELD_ID,
      PRICE_FIELD_ID,
    ]);
    expect(result[AGGREGATE_OPERATIONS.max]).toEqual([
      AMOUNT_FIELD_ID,
      PRICE_FIELD_ID,
    ]);
  });

  it('should exclude non-numeric fields', () => {
    const result = getAvailableFieldsIdsForAggregationFromObjectFields([
      { id: NAME_FIELD_ID, type: FieldMetadataType.Text } as FieldMetadataItem,
    ]);

    Object.values(AGGREGATE_OPERATIONS).forEach((operation) => {
      if (operation !== AGGREGATE_OPERATIONS.count) {
        expect(result[operation]).toEqual([]);
      }
    });
  });

  it('should handle empty fields array', () => {
    const result = getAvailableFieldsIdsForAggregationFromObjectFields([]);

    Object.values(AGGREGATE_OPERATIONS).forEach((operation) => {
      if (operation !== AGGREGATE_OPERATIONS.count) {
        expect(result[operation]).toEqual([]);
      }
    });
  });
});
