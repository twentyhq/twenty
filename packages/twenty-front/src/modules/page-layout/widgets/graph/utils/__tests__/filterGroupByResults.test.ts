import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { FieldMetadataType } from 'twenty-shared/types';
import { filterGroupByResults } from '@/page-layout/widgets/graph/utils/filterGroupByResults';

describe('filterGroupByResults', () => {
  const mockAggregateField = {
    id: 'field-1',
    name: 'amount',
    type: FieldMetadataType.NUMBER,
    label: 'Amount',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  };

  const mockObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [mockAggregateField],
  } as any;

  const createMockResult = (value: number | null) => ({
    groupByDimensionValues: ['Group A'],
    SUM_amount: value,
  });

  describe('rangeMin filtering', () => {
    it('should filter out results below rangeMin', () => {
      const rawResults = [
        createMockResult(500),
        createMockResult(1500),
        createMockResult(2500),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: { rangeMin: 1000 },
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].SUM_amount).toBe(1500);
      expect(filtered[1].SUM_amount).toBe(2500);
    });

    it('should include values equal to rangeMin', () => {
      const rawResults = [
        createMockResult(500),
        createMockResult(1000),
        createMockResult(1500),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: { rangeMin: 1000 },
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].SUM_amount).toBe(1000);
      expect(filtered[1].SUM_amount).toBe(1500);
    });
  });

  describe('rangeMax filtering', () => {
    it('should filter out results above rangeMax', () => {
      const rawResults = [
        createMockResult(500),
        createMockResult(1500),
        createMockResult(2500),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: { rangeMax: 2000 },
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].SUM_amount).toBe(500);
      expect(filtered[1].SUM_amount).toBe(1500);
    });

    it('should include values equal to rangeMax', () => {
      const rawResults = [
        createMockResult(1500),
        createMockResult(2000),
        createMockResult(2500),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: { rangeMax: 2000 },
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toHaveLength(2);
      expect(filtered[0].SUM_amount).toBe(1500);
      expect(filtered[1].SUM_amount).toBe(2000);
    });
  });

  describe('range filtering', () => {
    it('should keep only results within range', () => {
      const rawResults = [
        createMockResult(500),
        createMockResult(1500),
        createMockResult(2500),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: { rangeMin: 1000, rangeMax: 2000 },
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toHaveLength(1);
      expect(filtered[0].SUM_amount).toBe(1500);
    });

    it('should include boundary values', () => {
      const rawResults = [
        createMockResult(500),
        createMockResult(1000),
        createMockResult(1500),
        createMockResult(2000),
        createMockResult(2500),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: { rangeMin: 1000, rangeMax: 2000 },
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toHaveLength(3);
      expect(filtered[0].SUM_amount).toBe(1000);
      expect(filtered[1].SUM_amount).toBe(1500);
      expect(filtered[2].SUM_amount).toBe(2000);
    });
  });

  describe('no filters', () => {
    it('should return all results when no filters are active', () => {
      const rawResults = [
        createMockResult(500),
        createMockResult(1500),
        createMockResult(2500),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: {},
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toEqual(rawResults);
    });

    it('should return all results when omitNullValues is false', () => {
      const rawResults = [
        createMockResult(null),
        createMockResult(0),
        createMockResult(100),
      ];

      const filtered = filterGroupByResults({
        rawResults,
        filterOptions: { omitNullValues: false },
        aggregateField: mockAggregateField,
        aggregateOperation: AggregateOperations.SUM,
        aggregateOperationFromRawResult: 'SUM_amount',
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(filtered).toEqual(rawResults);
    });
  });
});
