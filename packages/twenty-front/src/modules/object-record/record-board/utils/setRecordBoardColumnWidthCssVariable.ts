import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';

export const getRecordBoardColumnWidthContainerId = (recordBoardId: string) =>
  `record-board-column-width-container-${recordBoardId}`;

export const setRecordBoardColumnWidthCssVariable = (
  recordBoardId: string,
  widthInPixels: number,
) => {
  document
    .getElementById(getRecordBoardColumnWidthContainerId(recordBoardId))
    ?.style.setProperty(
      RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME,
      `${widthInPixels}px`,
    );
};
