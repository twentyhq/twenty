import { type ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getViewFiltersToUpdate } from '@/views/utils/getViewFiltersToUpdate';

describe('getViewFiltersToUpdate', () => {
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
    const existingFilter = { ...baseFilter } satisfies ViewFilter;
    const updatedFilter = {
      ...baseFilter,
      value: 'updated-value',
      displayValue: 'updated-value',
    } satisfies ViewFilter;

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [updatedFilter];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([updatedFilter]);
  });

  it('should not return filters that exist in both arrays with same values', () => {
    const existingFilter = { ...baseFilter } satisfies ViewFilter;
    const sameFilter = { ...baseFilter } satisfies ViewFilter;

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

  it('should update filter when operand changes', () => {
    const existingFilter = { ...baseFilter } satisfies ViewFilter;
    const filterWithNewOperand = {
      ...baseFilter,
      operand: ViewFilterOperand.DOES_NOT_CONTAIN,
    } satisfies ViewFilter;

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [filterWithNewOperand];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterWithNewOperand]);
  });

  it('should update filter when position changes', () => {
    const existingFilter = { ...baseFilter } satisfies ViewFilter;
    const filterWithNewPosition = {
      ...baseFilter,
      positionInViewFilterGroup: 1,
    } satisfies ViewFilter;

    const currentViewFilters: ViewFilter[] = [existingFilter];
    const newViewFilters: ViewFilter[] = [filterWithNewPosition];

    const result = getViewFiltersToUpdate(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterWithNewPosition]);
  });
});
