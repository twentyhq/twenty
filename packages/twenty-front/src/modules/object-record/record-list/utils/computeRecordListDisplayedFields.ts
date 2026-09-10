import { RECORD_LIST_ROW_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMaxWidth';
import { RECORD_LIST_ROW_FIELD_MIN_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMinWidth';
import { RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH } from '@/object-record/record-list/constants/RecordListRowLabelIdentifierWidth';
import { RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH } from '@/object-record/record-list/constants/RecordListRowOverflowChipSlotWidth';
import { type RecordListDisplayedFields } from '@/object-record/record-list/types/RecordListDisplayedFields';

const ROW_HORIZONTAL_PADDING_WIDTH = 12;
const ROW_ITEM_GAP_WIDTH = 12;

// Takes the width a row actually renders in, not the list container's own
// width: a field told it may be wider than its slot is cut rather than
// ellipsised.
export const computeRecordListDisplayedFields = ({
  rowWidth,
  populatedFieldCount,
}: {
  rowWidth: number;
  populatedFieldCount: number;
}): RecordListDisplayedFields => {
  const widthAvailableWithoutOverflowChip =
    rowWidth -
    ROW_HORIZONTAL_PADDING_WIDTH -
    RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH -
    ROW_ITEM_GAP_WIDTH;

  const widthNeededToDisplayAllFields =
    populatedFieldCount * RECORD_LIST_ROW_FIELD_MIN_WIDTH +
    Math.max(populatedFieldCount - 1, 0) * ROW_ITEM_GAP_WIDTH;

  const shouldShowOverflowChip =
    widthNeededToDisplayAllFields > widthAvailableWithoutOverflowChip;

  const widthAvailableForFields =
    widthAvailableWithoutOverflowChip -
    (shouldShowOverflowChip ? RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH : 0);

  const displayedFieldCount = shouldShowOverflowChip
    ? Math.max(
        0,
        Math.floor(
          widthAvailableForFields /
            (RECORD_LIST_ROW_FIELD_MIN_WIDTH + ROW_ITEM_GAP_WIDTH),
        ),
      )
    : populatedFieldCount;

  if (displayedFieldCount === 0) {
    return {
      displayedFieldCount,
      displayedFieldMaxWidth: RECORD_LIST_ROW_FIELD_MAX_WIDTH,
    };
  }

  const gapCount = shouldShowOverflowChip
    ? displayedFieldCount
    : displayedFieldCount - 1;

  const displayedFieldMaxWidth = Math.min(
    RECORD_LIST_ROW_FIELD_MAX_WIDTH,
    Math.floor(
      (widthAvailableForFields - gapCount * ROW_ITEM_GAP_WIDTH) /
        displayedFieldCount,
    ),
  );

  return { displayedFieldCount, displayedFieldMaxWidth };
};
