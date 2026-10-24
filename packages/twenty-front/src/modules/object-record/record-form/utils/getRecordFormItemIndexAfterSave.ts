import { isDefined } from 'twenty-shared/utils';

export const getRecordFormItemIndexAfterSave = ({
  itemIndex,
  removedItemIndex,
}: {
  itemIndex: number;
  removedItemIndex: number | null;
}): number | null => {
  if (!isDefined(removedItemIndex)) {
    return itemIndex;
  }

  if (itemIndex === removedItemIndex) {
    return null;
  }

  return itemIndex > removedItemIndex ? itemIndex - 1 : itemIndex;
};
