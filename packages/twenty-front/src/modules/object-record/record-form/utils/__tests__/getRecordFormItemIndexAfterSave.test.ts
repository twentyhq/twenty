import { getRecordFormItemIndexAfterSave } from '@/object-record/record-form/utils/getRecordFormItemIndexAfterSave';

describe('getRecordFormItemIndexAfterSave', () => {
  it('keeps the index when no item was removed', () => {
    expect(
      getRecordFormItemIndexAfterSave({
        itemIndex: 2,
        removedItemIndex: null,
      }),
    ).toBe(2);
  });

  it('shifts an index that came after the removed item', () => {
    expect(
      getRecordFormItemIndexAfterSave({ itemIndex: 3, removedItemIndex: 1 }),
    ).toBe(2);
  });

  it('keeps an index that came before the removed item', () => {
    expect(
      getRecordFormItemIndexAfterSave({ itemIndex: 0, removedItemIndex: 1 }),
    ).toBe(0);
  });

  it('returns null for the removed item itself', () => {
    expect(
      getRecordFormItemIndexAfterSave({ itemIndex: 1, removedItemIndex: 1 }),
    ).toBeNull();
  });
});
