import { ViewSort } from '@/views/types/ViewSort';
import { getViewSortsToCreate } from '../getViewSortsToCreate';

describe('getViewSortsToCreate', () => {
  const baseSort: ViewSort = {
    __typename: 'ViewSort',
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: 'asc',
  };

  it('should return all sorts when current sorts array is empty', () => {
    const currentViewSorts: ViewSort[] = [];
    const newViewSorts: ViewSort[] = [
      { ...baseSort },
      {
        ...baseSort,
        id: 'sort-2',
        fieldMetadataId: 'field-2',
      } satisfies ViewSort,
    ];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual(newViewSorts);
  });

  it('should return empty array when new sorts array is empty', () => {
    const currentViewSorts: ViewSort[] = [baseSort];
    const newViewSorts: ViewSort[] = [];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should return only sorts that do not exist in current sorts', () => {
    const existingSort = { ...baseSort };
    const newSortWithDifferentFieldMetadataId = {
      ...baseSort,
      id: 'sort-2',
      fieldMetadataId: 'field-2',
    } satisfies ViewSort;

    const currentViewSorts: ViewSort[] = [existingSort];

    const newViewSorts: ViewSort[] = [
      existingSort,
      newSortWithDifferentFieldMetadataId,
    ];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual([newSortWithDifferentFieldMetadataId]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewSorts: ViewSort[] = [];
    const newViewSorts: ViewSort[] = [];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });
});
