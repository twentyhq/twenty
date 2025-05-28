import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { FieldMetadataType } from '~/generated/graphql';

const AMOUNT_FIELD_ID = '7d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0a';
const PRICE_FIELD_ID = '9d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0b';
const NAME_FIELD_ID = '5d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0c';
const ACTIVE_FIELD_ID = '0825d011-6006-49a2-99c5-8d67bed77e55';

const FIELDS_MOCKS = [
  { id: AMOUNT_FIELD_ID, type: FieldMetadataType.NUMBER, name: 'amount' },
  { id: PRICE_FIELD_ID, type: FieldMetadataType.CURRENCY, name: 'price' },
  { id: NAME_FIELD_ID, type: FieldMetadataType.TEXT, name: 'name' },
  { id: ACTIVE_FIELD_ID, type: FieldMetadataType.BOOLEAN, name: 'active' },
];

jest.mock(
  '@/object-record/utils/getAvailableAggregationsFromObjectFields',
  () => ({
    getAvailableAggregationsFromObjectFields: jest.fn().mockReturnValue({
      active: {
        [AggregateOperations.countTrue]: 'countTrueActive',
        [AggregateOperations.countFalse]: 'CountFalseActive',
      },
      amount: {
        [AggregateOperations.sum]: 'sumAmount',
        [AggregateOperations.avg]: 'avgAmount',
        [AggregateOperations.min]: 'minAmount',
        [AggregateOperations.max]: 'maxAmount',
        [AggregateOperations.count]: 'totalCount',
        [AggregateOperations.countUniqueValues]: 'countUniqueValuesAmount',
        [AggregateOperations.countEmpty]: 'countEmptyAmount',
        [AggregateOperations.countNotEmpty]: 'countNotEmptyAmount',
        [AggregateOperations.percentageEmpty]: 'percentageEmptyAmount',
        [AggregateOperations.percentageNotEmpty]: 'percentageNotEmptyAmount',
      },
      price: {
        [AggregateOperations.sum]: 'sumPriceAmountMicros',
        [AggregateOperations.avg]: 'avgPriceAmountMicros',
        [AggregateOperations.min]: 'minPriceAmountMicros',
        [AggregateOperations.max]: 'maxPriceAmountMicros',
        [AggregateOperations.count]: 'totalCount',
        [AggregateOperations.countUniqueValues]:
          'countUniqueValuesPriceAmountMicros',
        [AggregateOperations.countEmpty]: 'countEmptyPriceAmountMicros',
        [AggregateOperations.countNotEmpty]: 'countNotEmptyPriceAmountMicros',
        [AggregateOperations.percentageEmpty]:
          'percentageEmptyPriceAmountMicros',
        [AggregateOperations.percentageNotEmpty]:
          'percentageNotEmptyPriceAmountMicros',
      },
      name: {
        [AggregateOperations.count]: 'totalCount',
        [AggregateOperations.countUniqueValues]: 'countUniqueValuesName',
        [AggregateOperations.countEmpty]: 'countEmptyName',
        [AggregateOperations.countNotEmpty]: 'countNotEmptyName',
        [AggregateOperations.percentageEmpty]: 'percentageEmptyName',
        [AggregateOperations.percentageNotEmpty]: 'percentageNotEmptyName',
      },
    }),
  }),
);

describe('getAvailableFieldsIdsForAggregationFromObjectFields', () => {
  it('should handle empty fields array', () => {
    const result = getAvailableFieldsIdsForAggregationFromObjectFields(
      [],
      COUNT_AGGREGATE_OPERATION_OPTIONS,
    );

    COUNT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
      expect(result[operation]).toEqual([]);
    });
  });

  describe('with count aggregate operations', () => {
    it('should include all fields', () => {
      const result = getAvailableFieldsIdsForAggregationFromObjectFields(
        FIELDS_MOCKS as FieldMetadataItem[],
        COUNT_AGGREGATE_OPERATION_OPTIONS,
      );

      expect(result.COUNT).toEqual(
        expect.arrayContaining([
          AMOUNT_FIELD_ID,
          PRICE_FIELD_ID,
          NAME_FIELD_ID,
        ]),
      );

      expect(result.COUNT_TRUE).toContain(ACTIVE_FIELD_ID);
      expect(result.COUNT_FALSE).toContain(ACTIVE_FIELD_ID);

      PERCENT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toBeUndefined();
      });

      NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toBeUndefined();
      });
    });
  });

  describe('with percentage aggregate operations', () => {
    it('should include all fields', () => {
      const result = getAvailableFieldsIdsForAggregationFromObjectFields(
        FIELDS_MOCKS as FieldMetadataItem[],
        PERCENT_AGGREGATE_OPERATION_OPTIONS,
      );

      PERCENT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toEqual([
          AMOUNT_FIELD_ID,
          PRICE_FIELD_ID,
          NAME_FIELD_ID,
        ]);
      });

      COUNT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toBeUndefined();
      });

      NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toBeUndefined();
      });
    });
  });

  describe('with non standard aggregate operations', () => {
    it('should exclude non-numeric fields', () => {
      const result = getAvailableFieldsIdsForAggregationFromObjectFields(
        FIELDS_MOCKS as FieldMetadataItem[],
        NON_STANDARD_AGGREGATE_OPERATION_OPTIONS,
      );

      COUNT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toBeUndefined();
      });

      PERCENT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toBeUndefined();
      });

      NON_STANDARD_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toEqual([AMOUNT_FIELD_ID, PRICE_FIELD_ID]);
      });
    });
  });
});
