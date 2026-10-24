import { type MultiItemInputTarget } from '@/object-record/record-field/ui/meta-types/input/types/MultiItemInputTarget';

export const getRecordFormMultiItemInputTarget = ({
  itemCount,
  maxItemCount,
}: {
  itemCount: number;
  maxItemCount: number;
}): MultiItemInputTarget => {
  if (maxItemCount === 1) {
    return itemCount > 0
      ? { type: 'existing-item', itemIndex: 0 }
      : { type: 'new-item' };
  }

  return itemCount < maxItemCount ? { type: 'new-item' } : { type: 'closed' };
};
