import { getRecordFormMultiItemInputTarget } from '@/object-record/record-form/utils/getRecordFormMultiItemInputTarget';

describe('getRecordFormMultiItemInputTarget', () => {
  it('opens a new item input below the limit', () => {
    expect(
      getRecordFormMultiItemInputTarget({ itemCount: 2, maxItemCount: 5 }),
    ).toEqual({ type: 'new-item' });
  });

  it('stays closed once the limit is reached', () => {
    expect(
      getRecordFormMultiItemInputTarget({ itemCount: 5, maxItemCount: 5 }),
    ).toEqual({ type: 'closed' });
  });

  it('edits the only value of a single value field', () => {
    expect(
      getRecordFormMultiItemInputTarget({ itemCount: 1, maxItemCount: 1 }),
    ).toEqual({ type: 'existing-item', itemIndex: 0 });
  });

  it('opens a new item input for an empty single value field', () => {
    expect(
      getRecordFormMultiItemInputTarget({ itemCount: 0, maxItemCount: 1 }),
    ).toEqual({ type: 'new-item' });
  });
});
