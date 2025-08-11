import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { COUNT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/countAggregateOperationOptions';
import { NON_STANDARD_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/nonStandardAggregateOperationsOptions';
import { PERCENT_AGGREGATE_OPERATION_OPTIONS } from '@/object-record/record-table/record-table-footer/constants/percentAggregateOperationOptions';
import { getAvailableFieldsIdsForAggregationFromObjectFields } from '@/object-record/utils/getAvailableFieldsIdsForAggregationFromObjectFields';
import { FieldMetadataType } from '~/generated-metadata/graphql';

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
        [AggregateOperations.COUNT_TRUE]: 'countTrueActive',
        [AggregateOperations.COUNT_FALSE]: 'CountFalseActive',
      },
      amount: {
        [AggregateOperations.SUM]: 'sumAmount',
        [AggregateOperations.AVG]: 'avgAmount',
        [AggregateOperations.MIN]: 'minAmount',
        [AggregateOperations.MAX]: 'maxAmount',
        [AggregateOperations.COUNT]: 'totalCount',
        [AggregateOperations.COUNT_UNIQUE_VALUES]: 'countUniqueValuesAmount',
        [AggregateOperations.COUNT_EMPTY]: 'countEmptyAmount',
        [AggregateOperations.COUNT_NOT_EMPTY]: 'countNotEmptyAmount',
        [AggregateOperations.PERCENTAGE_EMPTY]: 'percentageEmptyAmount',
        [AggregateOperations.PERCENTAGE_NOT_EMPTY]: 'percentageNotEmptyAmount',
      },
      price: {
        [AggregateOperations.SUM]: 'sumPriceAmountMicros',
        [AggregateOperations.AVG]: 'avgPriceAmountMicros',
        [AggregateOperations.MIN]: 'minPriceAmountMicros',
        [AggregateOperations.MAX]: 'maxPriceAmountMicros',
        [AggregateOperations.COUNT]: 'totalCount',
        [AggregateOperations.COUNT_UNIQUE_VALUES]:
          'countUniqueValuesPriceAmountMicros',
        [AggregateOperations.COUNT_EMPTY]: 'countEmptyPriceAmountMicros',
        [AggregateOperations.COUNT_NOT_EMPTY]: 'countNotEmptyPriceAmountMicros',
        [AggregateOperations.PERCENTAGE_EMPTY]:
          'percentageEmptyPriceAmountMicros',
        [AggregateOperations.PERCENTAGE_NOT_EMPTY]:
          'percentageNotEmptyPriceAmountMicros',
      },
      name: {
        [AggregateOperations.COUNT]: 'totalCount',
        [AggregateOperations.COUNT_UNIQUE_VALUES]: 'countUniqueValuesName',
        [AggregateOperations.COUNT_EMPTY]: 'countEmptyName',
        [AggregateOperations.COUNT_NOT_EMPTY]: 'countNotEmptyName',
        [AggregateOperations.PERCENTAGE_EMPTY]: 'percentageEmptyName',
        [AggregateOperations.PERCENTAGE_NOT_EMPTY]: 'percentageNotEmptyName',
      },
    }),
  }),
);

describe('getAvailableFieldsIdsForAggregationFromObjectFields', () => {
  it('should handle empty fields array', () => {
    const result = getAvailableFieldsIdsForAggregationFromObjectFields({
      fields: [],
      targetAggregateOperations: COUNT_AGGREGATE_OPERATION_OPTIONS,
    });

    COUNT_AGGREGATE_OPERATION_OPTIONS.forEach((operation) => {
      expect(result[operation]).toEqual([]);
    });
  });

  describe('with count aggregate operations', () => {
    it('should include all fields', () => {
      const result = getAvailableFieldsIdsForAggregationFromObjectFields({
        fields: FIELDS_MOCKS as FieldMetadataItem[],
        targetAggregateOperations: COUNT_AGGREGATE_OPERATION_OPTIONS,
      });

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
      const result = getAvailableFieldsIdsForAggregationFromObjectFields({
        fields: FIELDS_MOCKS as FieldMetadataItem[],
        targetAggregateOperations: PERCENT_AGGREGATE_OPERATION_OPTIONS,
      });

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
      const result = getAvailableFieldsIdsForAggregationFromObjectFields({
        fields: FIELDS_MOCKS as FieldMetadataItem[],
        targetAggregateOperations: NON_STANDARD_AGGREGATE_OPERATION_OPTIONS,
      });

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
