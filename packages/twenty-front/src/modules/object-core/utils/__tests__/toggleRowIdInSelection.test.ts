import { toggleRowIdInSelection } from '@/object-core/utils/toggleRowIdInSelection';

describe('toggleRowIdInSelection', () => {
  it('should add a row that is not selected', () => {
    expect(
      toggleRowIdInSelection({ selectedRowIds: ['a'], rowId: 'b' }),
    ).toEqual(['a', 'b']);
  });

  it('should remove a row that is already selected', () => {
    expect(
      toggleRowIdInSelection({ selectedRowIds: ['a', 'b'], rowId: 'a' }),
    ).toEqual(['b']);
  });

  it('should not mutate the previous selection', () => {
    const selectedRowIds = ['a'];

    toggleRowIdInSelection({ selectedRowIds, rowId: 'b' });

    expect(selectedRowIds).toEqual(['a']);
  });
});
