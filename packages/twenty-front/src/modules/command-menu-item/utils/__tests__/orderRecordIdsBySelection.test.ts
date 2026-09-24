import { orderRecordIdsBySelection } from '@/command-menu-item/utils/orderRecordIdsBySelection';

describe('orderRecordIdsBySelection', () => {
  it('puts a new selection last even when it comes first in the view', () => {
    expect(
      orderRecordIdsBySelection({
        previousRecordIdsInSelectionOrder: ['b', 'c', 'd'],
        selectedRecordIds: ['a', 'b', 'c', 'd'],
      }),
    ).toEqual(['b', 'c', 'd', 'a']);
  });

  it('drops unselected records and keeps the rest in selection order', () => {
    expect(
      orderRecordIdsBySelection({
        previousRecordIdsInSelectionOrder: ['d', 'a', 'c'],
        selectedRecordIds: ['c', 'd'],
      }),
    ).toEqual(['d', 'c']);
  });

  it('keeps the given order when there is no history', () => {
    expect(
      orderRecordIdsBySelection({
        previousRecordIdsInSelectionOrder: [],
        selectedRecordIds: ['a', 'b'],
      }),
    ).toEqual(['a', 'b']);
  });
});
