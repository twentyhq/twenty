import { RecordSortDirection } from '@/object-record/record-sort/types/RecordSortDirection';
import { ViewSort } from '@/views/types/ViewSort';
import { areViewSortsEqual } from '@/views/utils/areViewSortsEqual';

describe('areViewSortsEqual', () => {
  const baseSort: ViewSort = {
    __typename: 'ViewSort',
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: 'asc',
  };

  it('should return true when all comparable properties are equal', () => {
    const sortA = { ...baseSort };
    const sortB = { ...baseSort };

    expect(areViewSortsEqual(sortA, sortB)).toBe(true);
  });

  it('should return false when displayValue is different', () => {
    const sortA = { ...baseSort };
    const sortB = { ...baseSort, direction: 'desc' as RecordSortDirection };

    expect(areViewSortsEqual(sortA, sortB)).toBe(false);
  });

  it('should return false when fieldMetadataId is different', () => {
    const sortA = { ...baseSort };
    const sortB = { ...baseSort, fieldMetadataId: 'field-2' };

    expect(areViewSortsEqual(sortA, sortB)).toBe(false);
  });

  it('should ignore non-comparable properties', () => {
    const sortA = { ...baseSort, id: 'id-1', createdAt: '2023-01-01' };
    const sortB = { ...baseSort, id: 'id-2', createdAt: '2023-01-02' };

    expect(areViewSortsEqual(sortA, sortB)).toBe(true);
  });
});
