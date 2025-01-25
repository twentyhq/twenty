import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getViewFiltersToUpdate } from '../getViewFiltersToUpdate';

describe('getViewFiltersToUpdate', () => {
  const baseFilter: ViewFilter = {
    __typename: 'ViewFilter',
    id: 'filter-1',
    fieldMetadataId: 'field-1',
    operand: ViewFilterOperand.Contains,
    value: 'test',
    displayValue: 'test',
    viewFilterGroupId: 'group-1',
    positionInViewFilterGroup: 0,
  };

  it('should return empty array when current filters array is empty', () => {
    const currentViewFilters: ViewFilter[] = [];
    const newViewFilters: ViewFilter[] = [baseFilter];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should return empty array when new filters array is empty', () => {
    const currentViewFilters: ViewFilter[] = [baseFilter];
    const newViewFilters: ViewFilter[] = [];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should return filters that exist in both arrays but have different values', () => {
    const existingFilter = { ...baseFilter };
    const updatedFilter = {
      ...baseFilter,
      value: 'updated-value',
      displayValue: 'updated-value',
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [updatedFilter];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([updatedFilter]);
  });

  it('should not return filters that exist in both arrays with same values', () => {
    const existingFilter = { ...baseFilter };
    const sameFilter = { ...baseFilter };

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [sameFilter];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewFilters: ViewFilter[] = [];
    const newViewFilters: ViewFilter[] = [];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should not update filters with same fieldMetadataId but different viewFilterGroupId', () => {
    const existingFilter = { ...baseFilter };
    const filterInDifferentGroup = {
      ...baseFilter,
      viewFilterGroupId: 'group-2',
      value: 'updated-value',
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [filterInDifferentGroup];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should not update filters with same viewFilterGroupId but different fieldMetadataId', () => {
    const existingFilter = { ...baseFilter };
    const filterWithDifferentField = {
      ...baseFilter,
      fieldMetadataId: 'field-2',
      value: 'updated-value',
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [filterWithDifferentField];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should update filter when operand changes', () => {
    const existingFilter = { ...baseFilter };
    const filterWithNewOperand = {
      ...baseFilter,
      operand: ViewFilterOperand.DoesNotContain,
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [filterWithNewOperand];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterWithNewOperand]);
  });

  it('should update filter when position changes', () => {
    const existingFilter = { ...baseFilter };
    const filterWithNewPosition = {
      ...baseFilter,
      positionInViewFilterGroup: 1,
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [filterWithNewPosition];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterWithNewPosition]);
  });
});
