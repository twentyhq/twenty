import { ViewFilter } from '@/views/types/ViewFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { getViewFiltersToCreate } from '../getViewFiltersToCreate';

describe('getViewFiltersToCreate', () => {
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

  it('should return all filters when current filters array is empty', () => {
    const currentViewFilters: ViewFilter[] = [];
    const newViewFilters: ViewFilter[] = [
      { ...baseFilter },
      { ...baseFilter, id: 'filter-2', fieldMetadataId: 'field-2' },
    ];

    const result = getViewFiltersToCreate(currentViewFilters, newViewFilters);

    expect(result).toEqual(newViewFilters);
  });

  it('should return empty array when new filters array is empty', () => {
    const currentViewFilters: ViewFilter[] = [baseFilter];
    const newViewFilters: ViewFilter[] = [];

    const result = getViewFiltersToCreate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should return only filters that do not exist in current filters', () => {
    const existingFilter = { ...baseFilter };
    const newFilterWithDifferentFieldMetadata = {
      ...baseFilter,
      id: 'filter-2',
      fieldMetadataId: 'field-2',
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];

    const newViewFilters: ViewFilter[] = [
      existingFilter,
      newFilterWithDifferentFieldMetadata,
    ];

    const result = getViewFiltersToCreate(currentViewFilters, newViewFilters);

    expect(result).toEqual([newFilterWithDifferentFieldMetadata]);
  });

  it('should handle filters with different viewFilterGroupIds', () => {
    const existingFilter = { ...baseFilter };
    const filterWithDifferentGroup = {
      ...baseFilter,
      viewFilterGroupId: 'group-2',
    };

    const currentViewFilters: ViewFilter[] = [existingFilter];

    const newViewFilters: ViewFilter[] = [
      existingFilter,
      filterWithDifferentGroup,
    ];

    const result = getViewFiltersToCreate(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterWithDifferentGroup]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewFilters: ViewFilter[] = [];
    const newViewFilters: ViewFilter[] = [];

    const result = getViewFiltersToCreate(currentViewFilters, newViewFilters);

    expect(result).toEqual([]);
  });

  it('should consider filters with same fieldMetadataId but different viewFilterGroupId as new', () => {
    const currentViewFilters: ViewFilter[] = [baseFilter];
    const filterWithSameFieldMetadataIdButDifferentGroup = {
      ...baseFilter,
      id: 'filter-2',
      viewFilterGroupId: 'group-2',
    };
    const newViewFilters: ViewFilter[] = [
      filterWithSameFieldMetadataIdButDifferentGroup,
    ];

    const result = getViewFiltersToCreate(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterWithSameFieldMetadataIdButDifferentGroup]);
  });

  it('should consider filters with same viewFilterGroupId but different fieldMetadataId as new', () => {
    const currentViewFilters: ViewFilter[] = [baseFilter];
    const filterWithSameGroupButDifferentFieldMetadata = {
      ...baseFilter,
      id: 'filter-2',
      fieldMetadataId: 'field-2',
    };
    const newViewFilters: ViewFilter[] = [
      filterWithSameGroupButDifferentFieldMetadata,
    ];

    const result = getViewFiltersToCreate(currentViewFilters, newViewFilters);

    expect(result).toEqual([filterWithSameGroupButDifferentFieldMetadata]);
  });
});
