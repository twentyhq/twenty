import { RECORD_LIST_ROW_FIELD_MAX_WIDTH } from '@/object-record/record-list/constants/RecordListRowFieldMaxWidth';
import { RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT } from '@/object-record/record-list/constants/RecordListRowVisibleFieldLimit';

const ROW_HORIZONTAL_PADDING_WIDTH = 12;
const LABEL_IDENTIFIER_WIDTH = 176;
const ROW_ITEM_GAP_WIDTH = 12;
const HIDDEN_FIELD_COUNT_CHIP_WIDTH = 40;

export const computeRecordListDisplayedFieldCount = (
  containerWidth: number,
) => {
  const reservedWidth =
    ROW_HORIZONTAL_PADDING_WIDTH +
    LABEL_IDENTIFIER_WIDTH +
    ROW_ITEM_GAP_WIDTH +
    HIDDEN_FIELD_COUNT_CHIP_WIDTH;

  const fieldWidthWithGap =
    RECORD_LIST_ROW_FIELD_MAX_WIDTH + ROW_ITEM_GAP_WIDTH;

  const fittingFieldCount = Math.floor(
    (containerWidth - reservedWidth) / fieldWidthWithGap,
  );

  return Math.min(
    RECORD_LIST_ROW_VISIBLE_FIELD_LIMIT,
    Math.max(0, fittingFieldCount),
  );
};
