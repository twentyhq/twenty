import { getInitialMultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/utils/getInitialMultiItemInputTarget';

describe('getInitialMultiItemInputTarget', () => {
  it('opens a new item input when there are no items', () => {
    expect(
      getInitialMultiItemInputTarget({ itemCount: 0, isSingleItemMode: false }),
    ).toEqual({ type: 'new-item' });
  });

  it('edits the only item in single item mode', () => {
    expect(
      getInitialMultiItemInputTarget({ itemCount: 1, isSingleItemMode: true }),
    ).toEqual({ type: 'existing-item', itemIndex: 0 });
  });

  it('stays closed when there are items to list', () => {
    expect(
      getInitialMultiItemInputTarget({ itemCount: 2, isSingleItemMode: false }),
    ).toEqual({ type: 'closed' });
  });

  it('stays closed when the field does not open empty', () => {
    expect(
      getInitialMultiItemInputTarget({
        itemCount: 0,
        isSingleItemMode: true,
        shouldOpenWhenEmpty: false,
      }),
    ).toEqual({ type: 'closed' });
  });
});
