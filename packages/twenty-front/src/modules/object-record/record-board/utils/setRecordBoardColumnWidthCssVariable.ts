import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { getRecordBoardHtmlId } from '@/object-record/record-board/utils/getRecordBoardHtmlId';

export const setRecordBoardColumnWidthCssVariable = (
  recordBoardId: string,
  widthInPixels: number,
) => {
  document
    .getElementById(getRecordBoardHtmlId(recordBoardId))
    ?.style.setProperty(
      RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME,
      `${widthInPixels}px`,
    );
};
