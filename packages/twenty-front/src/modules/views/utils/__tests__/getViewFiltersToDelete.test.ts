import { type ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getViewFiltersToDelete } from '@/views/utils/getViewFiltersToDelete';

describe('getViewFiltersToDelete', () => {
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
    } satisfies ViewFilter;

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
});
