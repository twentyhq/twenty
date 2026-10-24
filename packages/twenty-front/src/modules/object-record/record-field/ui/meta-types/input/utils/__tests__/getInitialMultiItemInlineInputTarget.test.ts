import { getInitialMultiItemInlineInputTarget } from '@/object-record/record-field/ui/meta-types/input/utils/getInitialMultiItemInlineInputTarget';

describe('getInitialMultiItemInlineInputTarget', () => {
  it('opens a new item input below the limit', () => {
    expect(
      getInitialMultiItemInlineInputTarget({ itemCount: 2, maxItemCount: 5 }),
    ).toEqual({ type: 'new-item' });
  });

  it('stays closed once the limit is reached', () => {
    expect(
      getInitialMultiItemInlineInputTarget({ itemCount: 5, maxItemCount: 5 }),
    ).toEqual({ type: 'closed' });
  });

  it('edits the only value of a single value field', () => {
    expect(
      getInitialMultiItemInlineInputTarget({ itemCount: 1, maxItemCount: 1 }),
    ).toEqual({ type: 'existing-item', itemIndex: 0 });
  });

  it('opens a new item input for an empty single value field', () => {
    expect(
      getInitialMultiItemInlineInputTarget({ itemCount: 0, maxItemCount: 1 }),
    ).toEqual({ type: 'new-item' });
  });
});
