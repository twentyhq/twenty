import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { isDefined } from 'twenty-shared/utils';
import { type useDropdownPlacement } from 'twenty-ui/components/navigation';

type GetMultipleRecordPickerLayoutDirectionArgs = ReturnType<
  typeof useDropdownPlacement
> & {
  layoutDirection?: RecordPickerLayoutDirection;
};

export const getMultipleRecordPickerLayoutDirection = ({
  layoutDirection,
  side,
  align,
}: GetMultipleRecordPickerLayoutDirectionArgs): RecordPickerLayoutDirection => {
  if (isDefined(layoutDirection)) {
    return layoutDirection;
  }

  const isHorizontalPopup = side === 'left' || side === 'right';
  const shouldPlaceSearchAtBottom =
    side === 'top' || (isHorizontalPopup && align === 'end');

  if (shouldPlaceSearchAtBottom) {
    return 'search-bar-on-bottom';
  }

  return 'search-bar-on-top';
};
