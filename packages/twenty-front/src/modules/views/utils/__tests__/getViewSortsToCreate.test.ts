import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { ViewSortDirection } from '~/generated/graphql';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';

describe('getViewSortsToCreate', () => {
  const baseSort: CoreViewSortEssential = {
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  it('should return all sorts when current sorts array is empty', () => {
    const currentViewSorts: CoreViewSortEssential[] = [];
    const newViewSorts: CoreViewSortEssential[] = [
      { ...baseSort },
      {
        ...baseSort,
        id: 'sort-2',
        fieldMetadataId: 'field-2',
      } satisfies CoreViewSortEssential,
    ];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual(newViewSorts);
  });

  it('should return empty array when new sorts array is empty', () => {
    const currentViewSorts: CoreViewSortEssential[] = [baseSort];
    const newViewSorts: CoreViewSortEssential[] = [];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should return only sorts that do not exist in current sorts', () => {
    const existingSort = { ...baseSort };
    const newSortWithDifferentFieldMetadataId = {
      ...baseSort,
      id: 'sort-2',
      fieldMetadataId: 'field-2',
    } satisfies CoreViewSortEssential;

    const currentViewSorts: CoreViewSortEssential[] = [existingSort];

    const newViewSorts: CoreViewSortEssential[] = [
      existingSort,
      newSortWithDifferentFieldMetadataId,
    ];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual([newSortWithDifferentFieldMetadataId]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewSorts: CoreViewSortEssential[] = [];
    const newViewSorts: CoreViewSortEssential[] = [];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });
});
