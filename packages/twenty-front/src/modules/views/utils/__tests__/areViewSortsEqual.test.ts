import { areViewSortsEqual } from '@/views/utils/areViewSortsEqual';
import { type CoreViewSort, ViewSortDirection } from '~/generated/graphql';

describe('areViewSortsEqual', () => {
  const baseSort: CoreViewSort = {
    __typename: 'CoreViewSort',
    id: 'sort-1',
    fieldMetadataId: 'field-1',
    direction: ViewSortDirection.ASC,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    viewId: 'view-1',
    workspaceId: 'workspace-1',
  };

  it('should return true when all comparable properties are equal', () => {
    const sortA = { ...baseSort };
    const sortB = { ...baseSort };

    expect(areViewSortsEqual(sortA, sortB)).toBe(true);
  });

  it('should return false when displayValue is different', () => {
    const sortA = { ...baseSort };
    const sortB = { ...baseSort, direction: 'desc' as ViewSortDirection };

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
