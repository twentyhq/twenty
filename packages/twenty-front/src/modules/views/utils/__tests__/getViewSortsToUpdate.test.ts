import { RecordSortDirection } from '@/object-record/record-sort/types/RecordSortDirection';
import { ViewSort } from '@/views/types/ViewSort';
import { getViewSortsToUpdate } from '../getViewSortsToUpdate';

describe('getViewSortsToUpdate', () => {
  const baseSort: ViewSort = {
    __typename: 'ViewSort',
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: 'asc' as RecordSortDirection,
  };

  it('should return empty array when current sorts array is empty', () => {
    const currentViewSorts: ViewSort[] = [];
    const newViewSorts: ViewSort[] = [baseSort];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should return empty array when new sorts array is empty', () => {
    const currentViewSorts: ViewSort[] = [baseSort];
    const newViewSorts: ViewSort[] = [];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should return sorts that exist in both arrays but have different direction', () => {
    const existingSort = { ...baseSort };
    const updatedSort = {
      ...baseSort,
      direction: 'desc',
    } satisfies ViewSort;

    const currentViewSorts: ViewSort[] = [existingSort];
    const newViewSorts: ViewSort[] = [updatedSort];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([updatedSort]);
  });

  it('should not return sorts that exist in both arrays with same values', () => {
    const existingSort = { ...baseSort };
    const sameSort = { ...baseSort };

    const currentViewSorts: ViewSort[] = [existingSort];
    const newViewSorts: ViewSort[] = [sameSort];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });

  it('should handle empty arrays for both inputs', () => {
    const currentViewSorts: ViewSort[] = [];
    const newViewSorts: ViewSort[] = [];

    const result = getViewSortsToUpdate(currentViewSorts, newViewSorts);

    expect(result).toEqual([]);
  });
});
