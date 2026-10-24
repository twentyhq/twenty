import { type MultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemInputTarget';

export const getInitialMultiItemInputTarget = ({
  itemCount,
  isSingleItemMode,
  shouldOpenWhenEmpty = true,
}: {
  itemCount: number;
  isSingleItemMode: boolean;
  shouldOpenWhenEmpty?: boolean;
}): MultiItemInputTarget => {
  if (!shouldOpenWhenEmpty) {
    return { type: 'closed' };
  }

  if (itemCount === 0) {
    return { type: 'new-item' };
  }

  return isSingleItemMode
    ? { type: 'existing-item', itemIndex: 0 }
    : { type: 'closed' };
};
