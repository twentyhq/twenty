import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_COLLAPSED_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnCollapsedWidthOnMobile';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_MAX_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnMaxWidthOnMobile';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_MIN_WIDTH_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnMinWidthOnMobile';
import { RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_RATIO_ON_MOBILE } from '@/object-record/record-table/constants/RecordTableLabelIdentifierColumnWidthRatioOnMobile';

export const computeRecordTableLabelIdentifierColumnWidthOnMobile = ({
  tableWidth,
  isCollapsed,
}: {
  tableWidth: number;
  isCollapsed: boolean;
}) => {
  if (isCollapsed) {
    return RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_COLLAPSED_WIDTH_ON_MOBILE;
  }

  const widthFromRatio =
    tableWidth * RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_WIDTH_RATIO_ON_MOBILE;

  return Math.round(
    Math.min(
      RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_MAX_WIDTH_ON_MOBILE,
      Math.max(
        RECORD_TABLE_LABEL_IDENTIFIER_COLUMN_MIN_WIDTH_ON_MOBILE,
        widthFromRatio,
      ),
    ),
  );
};
