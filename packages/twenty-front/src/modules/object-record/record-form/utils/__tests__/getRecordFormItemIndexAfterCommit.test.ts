import { getRecordFormItemIndexAfterCommit } from '@/object-record/record-form/utils/getRecordFormItemIndexAfterCommit';

describe('getRecordFormItemIndexAfterCommit', () => {
  it('keeps the index when no item was removed', () => {
    expect(
      getRecordFormItemIndexAfterCommit({
        itemIndex: 2,
        removedItemIndex: null,
      }),
    ).toBe(2);
  });

  it('shifts an index that came after the removed item', () => {
    expect(
      getRecordFormItemIndexAfterCommit({ itemIndex: 3, removedItemIndex: 1 }),
    ).toBe(2);
  });

  it('keeps an index that came before the removed item', () => {
    expect(
      getRecordFormItemIndexAfterCommit({ itemIndex: 0, removedItemIndex: 1 }),
    ).toBe(0);
  });

  it('returns null for the removed item itself', () => {
    expect(
      getRecordFormItemIndexAfterCommit({ itemIndex: 1, removedItemIndex: 1 }),
    ).toBeNull();
  });
});
