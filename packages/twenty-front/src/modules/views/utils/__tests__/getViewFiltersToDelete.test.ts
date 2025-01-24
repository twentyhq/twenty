import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getViewFiltersToDelete } from '../getViewFiltersToDelete';

describe('getViewFiltersToDelete', () => {
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

    const result = getViewFiltersToDelete(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should return all current filters when new filters array is empty', () => {
    const existingFilter = { ...baseFilter };
    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [];

    const result = getViewFiltersToDelete(currentViewFilters, newViewFilters);

    expect(result).toEqual([existingFilter]);
  });

  it('should return filters that exist in current but not in new filters', () => {
    const filterToDelete = { ...baseFilter };
    const filterToKeep = {
      ...baseFilter,
      id: 'filter-2',
      fieldMetadataId: 'field-2',
    };

    const currentViewFilters: ViewFilter[] = [filterToDelete, filterToKeep];
    const newViewFilters: ViewFilter[] = [filterToKeep];

    const result = getViewFiltersToDelete(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterToDelete]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewFilters: ViewFilter[] = [];
    const newViewFilters: ViewFilter[] = [];

    const result = getViewFiltersToDelete(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should identify filters to delete based on fieldMetadataId and viewFilterGroupId', () => {
    const filterInGroup1 = { ...baseFilter };
    const filterInGroup2 = {
      ...baseFilter,
      viewFilterGroupId: 'group-2',
    };
    const filterWithDifferentField = {
      ...baseFilter,
      fieldMetadataId: 'field-2',
    };

    const currentViewFilters: ViewFilter[] = [
      filterInGroup1,
      filterInGroup2,
      filterWithDifferentField,
    ];
    const newViewFilters: ViewFilter[] = [filterInGroup1];

    const result = getViewFiltersToDelete(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterInGroup2, filterWithDifferentField]);
  });

  it('should not delete filters that match in both fieldMetadataId and viewFilterGroupId', () => {
    const existingFilter = { ...baseFilter };
    const matchingFilter = {
      ...baseFilter,
      value: 'different-value',
      displayValue: 'different-value',
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [matchingFilter];

    const result = getViewFiltersToDelete(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });
});
