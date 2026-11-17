import { ViewSortDirection } from '~/generated-metadata/graphql';
import { getViewSortsToCreate } from '@/views/utils/getViewSortsToCreate';
import { type ViewSort } from '@/views/types/ViewSort';

describe('getViewSortsToCreate', () => {
  const baseSort: ViewSort = {
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: ViewSortDirection.ASC,
    viewId: 'view-1',
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

  it('should not recreate a saved sort that came back under a new id', () => {
    const sortBackOnItsField = { ...baseSort, id: 'sort-2' } satisfies ViewSort;

    const result = getViewSortsToCreate([baseSort], [sortBackOnItsField]);

    expect(result).toEqual([]);
  });

  it('should not recreate a saved sort that came back with another direction', () => {
    const sortBackInOtherDirection = {
      ...baseSort,
      id: 'sort-2',
      direction: ViewSortDirection.DESC,
    } satisfies ViewSort;

    const result = getViewSortsToCreate([baseSort], [sortBackInOtherDirection]);

    expect(result).toEqual([]);
  });

  it('should not recreate a saved sort that came back on another sub-field', () => {
    const savedSort = {
      ...baseSort,
      subFieldName: 'firstName',
    } satisfies ViewSort;
    const sortOnOtherSubField = {
      ...baseSort,
      id: 'sort-2',
      subFieldName: 'lastName',
    } satisfies ViewSort;

    const result = getViewSortsToCreate([savedSort], [sortOnOtherSubField]);

    expect(result).toEqual([]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewSorts: ViewSort[] = [];
    const newViewSorts: ViewSort[] = [];

    const result = getViewSortsToCreate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });
});
