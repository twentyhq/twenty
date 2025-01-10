import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AGGREGATE_OPERATIONS } from '@/object-record/record-table/constants/AggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { FieldMetadataType } from '~/generated/graphql';

const AMOUNT_FIELD_ID = '7d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0a';
const PRICE_FIELD_ID = '9d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0b';
const NAME_FIELD_ID = '5d2d7b5e-7b3e-4b4a-8b0a-7b3e4b4a8b0c';

const FIELDS_MOCKS = [
  { id: AMOUNT_FIELD_ID, type: FieldMetadataType.Number, name: 'amount' },
  { id: PRICE_FIELD_ID, type: FieldMetadataType.Currency, name: 'price' },
  { id: NAME_FIELD_ID, type: FieldMetadataType.Text, name: 'name' },
];

jest.mock(
  '@/object-record/utils/getAvailableAggregationsFromObjectFields',
  () => ({
    getAvailableAggregationsFromObjectFields: jest.fn().mockReturnValue({
      amount: {
        [AGGREGATE_OPERATIONS.sum]: 'sumAmount',
        [AGGREGATE_OPERATIONS.avg]: 'avgAmount',
        [AGGREGATE_OPERATIONS.min]: 'minAmount',
        [AGGREGATE_OPERATIONS.max]: 'maxAmount',
        [AGGREGATE_OPERATIONS.count]: 'totalCount',
        [AGGREGATE_OPERATIONS.countUniqueValues]: 'countUniqueValuesAmount',
        [AGGREGATE_OPERATIONS.countEmpty]: 'countEmptyAmount',
        [AGGREGATE_OPERATIONS.countNotEmpty]: 'countNotEmptyAmount',
        [AGGREGATE_OPERATIONS.percentageEmpty]: 'percentageEmptyAmount',
        [AGGREGATE_OPERATIONS.percentageNotEmpty]: 'percentageNotEmptyAmount',
      },
      price: {
        [AGGREGATE_OPERATIONS.sum]: 'sumPriceAmountMicros',
        [AGGREGATE_OPERATIONS.avg]: 'avgPriceAmountMicros',
        [AGGREGATE_OPERATIONS.min]: 'minPriceAmountMicros',
        [AGGREGATE_OPERATIONS.max]: 'maxPriceAmountMicros',
        [AGGREGATE_OPERATIONS.count]: 'totalCount',
        [AGGREGATE_OPERATIONS.countUniqueValues]:
          'countUniqueValuesPriceAmountMicros',
        [AGGREGATE_OPERATIONS.countEmpty]: 'countEmptyPriceAmountMicros',
        [AGGREGATE_OPERATIONS.countNotEmpty]: 'countNotEmptyPriceAmountMicros',
        [AGGREGATE_OPERATIONS.percentageEmpty]:
          'percentageEmptyPriceAmountMicros',
        [AGGREGATE_OPERATIONS.percentageNotEmpty]:
          'percentageNotEmptyPriceAmountMicros',
      },
      name: {
        [AGGREGATE_OPERATIONS.count]: 'totalCount',
        [AGGREGATE_OPERATIONS.countUniqueValues]: 'countUniqueValuesName',
        [AGGREGATE_OPERATIONS.countEmpty]: 'countEmptyName',
        [AGGREGATE_OPERATIONS.countNotEmpty]: 'countNotEmptyName',
        [AGGREGATE_OPERATIONS.percentageEmpty]: 'percentageEmptyName',
        [AGGREGATE_OPERATIONS.percentageNotEmpty]: 'percentageNotEmptyName',
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

      COUNT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
        expect(result[operation]).toEqual([
          AMOUNT_FIELD_ID,
          PRICE_FIELD_ID,
          NAME_FIELD_ID,
        ]);
      });

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
