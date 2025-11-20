import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { mapRecordFilterToUrlFilter } from '@/page-layout/widgets/graph/utils/mapRecordFilterToUrlFilter';
import { FieldMetadataType, ViewFilterOperand } from 'twenty-shared/types';

describe('mapRecordFilterToUrlFilter', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'obj-1',
    nameSingular: 'opportunity',
    namePlural: 'opportunities',
    fields: [
      { id: 'field-1', name: 'status', type: FieldMetadataType.SELECT },
      { id: 'field-2', name: 'name', type: FieldMetadataType.TEXT },
      { id: 'field-3', name: 'amount', type: FieldMetadataType.NUMBER },
    ],
  } as ObjectMetadataItem;

  it('should convert basic RecordFilter to UrlFilter', () => {
    const recordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'OPEN',
      operand: ViewFilterOperand.IS,
    } as RecordFilter;

    const result = mapRecordFilterToUrlFilter({
      recordFilter,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({
      field: 'status',
      op: ViewFilterOperand.IS,
      value: 'OPEN',
    });
  });

  it('should include subField when present', () => {
    const recordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-2',
      value: '2024-01-01',
      operand: ViewFilterOperand.IS_AFTER,
      subFieldName: 'date',
      displayValue: '2024-01-01',
      type: FieldMetadataType.TEXT,
      label: 'Name',
    } as unknown as RecordFilter;

    const result = mapRecordFilterToUrlFilter({
      recordFilter,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({
      field: 'name',
      op: ViewFilterOperand.IS_AFTER,
      value: '2024-01-01',
      subField: 'date',
    });
  });

  it('should not include subField when it is empty string', () => {
    const recordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'OPEN',
      operand: ViewFilterOperand.IS,
      subFieldName: '',
      displayValue: 'OPEN',
      type: FieldMetadataType.SELECT,
      label: 'Status',
    } as unknown as RecordFilter;

    const result = mapRecordFilterToUrlFilter({
      recordFilter,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({
      field: 'status',
      op: ViewFilterOperand.IS,
      value: 'OPEN',
    });
    expect(result?.subField).toBeUndefined();
  });

  it('should not include subField when it is undefined', () => {
    const recordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-1',
      value: 'OPEN',
      operand: ViewFilterOperand.IS,
      subFieldName: undefined,
    } as RecordFilter;

    const result = mapRecordFilterToUrlFilter({
      recordFilter,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toEqual({
      field: 'status',
      op: ViewFilterOperand.IS,
      value: 'OPEN',
    });
    expect(result?.subField).toBeUndefined();
  });

  it('should return null when field metadata is not found', () => {
    const recordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'non-existent-field',
      value: 'value',
      operand: ViewFilterOperand.IS,
    } as RecordFilter;

    const result = mapRecordFilterToUrlFilter({
      recordFilter,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result).toBeNull();
  });

  it('should handle different operands correctly', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.CONTAINS,
        expected: ViewFilterOperand.CONTAINS,
      },
      {
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        expected: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        expected: ViewFilterOperand.IS_EMPTY,
      },
    ];

    testCases.forEach(({ operand, expected }) => {
      const recordFilter: RecordFilter = {
        id: 'filter-1',
        fieldMetadataId: 'field-2',
        value: 'test-value',
        operand,
      } as RecordFilter;

      const result = mapRecordFilterToUrlFilter({
        recordFilter,
        objectMetadataItem: mockObjectMetadataItem,
      });

      expect(result?.op).toBe(expected);
    });
  });

  it('should preserve filter value as-is', () => {
    const recordFilter: RecordFilter = {
      id: 'filter-1',
      fieldMetadataId: 'field-3',
      value: '1000',
      operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
    } as RecordFilter;

    const result = mapRecordFilterToUrlFilter({
      recordFilter,
      objectMetadataItem: mockObjectMetadataItem,
    });

    expect(result?.value).toBe('1000');
  });
});
