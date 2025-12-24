import { type CoreViewSortEssential } from '@/views/types/CoreViewSortEssential';
import { ViewSortDirection } from '~/generated/graphql';
import { getViewSortsToUpdate } from '@/views/utils/getViewSortsToUpdate';

describe('getViewSortsToUpdate', () => {
  const baseSort: CoreViewSortEssential = {
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  it('should return empty array when current sorts array is empty', () => {
    const currentViewSorts: CoreViewSortEssential[] = [];
    const newViewSorts: CoreViewSortEssential[] = [baseSort];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should return empty array when new sorts array is empty', () => {
    const currentViewSorts: CoreViewSortEssential[] = [baseSort];
    const newViewSorts: CoreViewSortEssential[] = [];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should return sorts that exist in both arrays but have different direction', () => {
    const existingSort = { ...baseSort };
    const updatedSort = {
      ...baseSort,
      direction: ViewSortDirection.DESC,
    } satisfies CoreViewSortEssential;

    const currentViewSorts: CoreViewSortEssential[] = [existingSort];
    const newViewSorts: CoreViewSortEssential[] = [updatedSort];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([updatedSort]);
  });

  it('should not return sorts that exist in both arrays with same values', () => {
    const existingSort = { ...baseSort };
    const sameSort = { ...baseSort };

    const currentViewSorts: CoreViewSortEssential[] = [existingSort];
    const newViewSorts: CoreViewSortEssential[] = [sameSort];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewSorts: CoreViewSortEssential[] = [];
    const newViewSorts: CoreViewSortEssential[] = [];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });
});
