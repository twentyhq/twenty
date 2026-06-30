import { RECORD_BOARD_COLUMN_MAX_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnMaxWidth';
import { RECORD_BOARD_COLUMN_MIN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnMinWidth';

export const clampRecordBoardColumnWidth = (width: number): number =>
  Math.min(
    RECORD_BOARD_COLUMN_MAX_WIDTH,
    Math.max(RECORD_BOARD_COLUMN_MIN_WIDTH, width),
  );
