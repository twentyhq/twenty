import { type ViewSort } from '@/views/types/ViewSort';
import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getViewSortsToDelete } from '@/views/utils/getViewSortsToDelete';

describe('getViewSortsToDelete', () => {
  const baseSort: ViewSort = {
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
  };

  it('should return empty array when current sorts array is empty', () => {
    const currentViewSorts: ViewSort[] = [];
    const newViewSorts: ViewSort[] = [baseSort];

    const result = getViewSortsToDelete(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should return all current sorts when new sorts array is empty', () => {
    const existingSort = { ...baseSort };
    const currentViewSorts: ViewSort[] = [existingSort];
    const newViewSorts: ViewSort[] = [];

    const result = getViewSortsToDelete(currentViewSorts, newViewSorts);

    expect(result).toEqual([existingSort]);
  });

  it('should return sorts that exist in current but not in new sorts', () => {
    const sortToDelete = { ...baseSort };
    const sortToKeep = {
      ...baseSort,
      id: 'sort-2',
      fieldMetadataId: 'field-2',
    };

    const currentViewSorts: ViewSort[] = [sortToDelete, sortToKeep];
    const newViewSorts: ViewSort[] = [sortToKeep];

    const result = getViewSortsToDelete(currentViewSorts, newViewSorts);

    expect(result).toEqual([sortToDelete]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewSorts: ViewSort[] = [];
    const newViewSorts: ViewSort[] = [];

    const result = getViewSortsToDelete(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should not delete sorts that match in both fieldMetadataId and direction', () => {
    const existingSort = { ...baseSort };
    const matchingSort = {
      id: 'sort-2',
      fieldMetadataId: 'field-1',
      direction: ViewSortDirection.ASC,
      viewId: 'view-1',
    } as ViewSort;

    const currentViewSorts: ViewSort[] = [existingSort];
    const newViewSorts: ViewSort[] = [matchingSort];

    const result = getViewSortsToDelete(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });
});
