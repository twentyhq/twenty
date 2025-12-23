import { type ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { areViewFiltersEqual } from '@/views/utils/areViewFiltersEqual';

describe('areViewFiltersEqual', () => {
  const baseFilter: ViewFilter = {
    __typename: 'ViewFilter',
    id: 'filter-1',
    fieldMetadataId: 'field-1',
    operand: ViewFilterOperand.CONTAINS,
    value: 'test',
    displayValue: 'test',
    viewFilterGroupId: 'group-1',
    positionInViewFilterGroup: 0,
  };

  it('should return true when all comparable properties are equal', () => {
    const filterA = { ...baseFilter };
    const filterB = { ...baseFilter };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(true);
  });

  it('should return false when displayValue is different', () => {
    const filterA = { ...baseFilter };
    const filterB = { ...baseFilter, displayValue: 'different' };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(false);
  });

  it('should return false when fieldMetadataId is different', () => {
    const filterA = { ...baseFilter };
    const filterB = { ...baseFilter, fieldMetadataId: 'field-2' };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(false);
  });

  it('should return false when viewFilterGroupId is different', () => {
    const filterA = { ...baseFilter };
    const filterB = { ...baseFilter, viewFilterGroupId: 'group-2' };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(false);
  });

  it('should return false when operand is different', () => {
    const filterA = { ...baseFilter };
    const filterB = {
      ...baseFilter,
      operand: ViewFilterOperand.DOES_NOT_CONTAIN,
    };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(false);
  });

  it('should return false when positionInViewFilterGroup is different', () => {
    const filterA = { ...baseFilter };
    const filterB = { ...baseFilter, positionInViewFilterGroup: 1 };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(false);
  });

  it('should return false when value is different', () => {
    const filterA = { ...baseFilter };
    const filterB = { ...baseFilter, value: 'different' };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(false);
  });

  it('should ignore non-comparable properties', () => {
    const filterA = { ...baseFilter, id: 'id-1', createdAt: '2023-01-01' };
    const filterB = { ...baseFilter, id: 'id-2', createdAt: '2023-01-02' };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(true);
  });

  it('should handle undefined optional properties', () => {
    const filterA = { ...baseFilter, viewFilterGroupId: undefined };
    const filterB = { ...baseFilter, viewFilterGroupId: undefined };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(true);
  });

  it('should handle one filter having optional property and other not', () => {
    const filterA = { ...baseFilter, viewFilterGroupId: 'group-1' };
    const filterB = { ...baseFilter, viewFilterGroupId: undefined };

    expect(areViewFiltersEqual(filterA, filterB)).toBe(false);
  });
});
