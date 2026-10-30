import { type RecordPickerLayoutDirection } from '@/object-record/record-picker/types/RecordPickerLayoutDirection';
import { isDefined } from 'twenty-shared/utils';
import { type useDropdownPlacementOrThrow } from 'twenty-ui/components/navigation';

type GetMultipleRecordPickerLayoutDirectionArgs = Pick<
  ReturnType<typeof useDropdownPlacementOrThrow>,
  'side' | 'align'
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
