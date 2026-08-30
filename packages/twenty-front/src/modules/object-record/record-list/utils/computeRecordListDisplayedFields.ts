import { RECORD_LIST_ROW_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMaxWidth';
import { RECORD_LIST_ROW_FIELD_MIN_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMinWidth';
import { RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH } from '@/object-record/record-list/constants/RecordListRowLabelIdentifierWidth';
import { RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT } from '@/object-record/record-list/constants/RecordListRowVisibleFieldLimit';
import { type RecordListDisplayedFields } from '@/object-record/record-list/types/RecordListDisplayedFields';

const ROW_HORIZONTAL_PADDING_WIDTH = 12;
const ROW_ITEM_GAP_WIDTH = 12;
const HIDDEN_FIELD_COUNT_CHIP_WIDTH = 40;

const computeDisplayedFieldCount = (widthLeftForFields: number) => {
  const fullWidthFieldCount = Math.floor(
    widthLeftForFields / (RECORD_LIST_ROW_FIELD_MAX_WIDTH + ROW_ITEM_GAP_WIDTH),
  );

  if (fullWidthFieldCount >= 1) {
    return Math.min(RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT, fullWidthFieldCount);
  }

  // No phone is wide enough for a full-width field once the record label and
  // the hidden-count chip are paid for, and a row that shows only "+5" says
  // nothing about the record. Below that breakpoint, keep a single field and
  // narrow it into whatever is left.
  return widthLeftForFields >=
    RECORD_LIST_ROW_FIELD_MIN_WIDTH + ROW_ITEM_GAP_WIDTH
    ? 1
    : 0;
};

// Takes the width a row actually renders in, not the list container's own
// width: a field told it may be wider than its slot is cut rather than
// ellipsised.
export const computeRecordListDisplayedFields = (
  rowWidth: number,
): RecordListDisplayedFields => {
  const reservedWidth =
    ROW_HORIZONTAL_PADDING_WIDTH +
    RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH +
    ROW_ITEM_GAP_WIDTH +
    HIDDEN_FIELD_COUNT_CHIP_WIDTH;

  const widthLeftForFields = rowWidth - reservedWidth;

  const displayedFieldCount = computeDisplayedFieldCount(widthLeftForFields);

  if (displayedFieldCount === 0) {
    return {
      displayedFieldCount,
      displayedFieldMaxWidth: RECORD_LIST_ROW_FIELD_MAX_WIDTH,
    };
  }

  // Fields truncate at the width they are given rather than at the width they
  // were promised: one told it may take 156px inside a 131px slot renders past
  // its box and is cut mid-word instead of ellipsised.
  const displayedFieldMaxWidth = Math.min(
    RECORD_LIST_ROW_FIELD_MAX_WIDTH,
    Math.floor(widthLeftForFields / displayedFieldCount) - ROW_ITEM_GAP_WIDTH,
  );

  return { displayedFieldCount, displayedFieldMaxWidth };
};
