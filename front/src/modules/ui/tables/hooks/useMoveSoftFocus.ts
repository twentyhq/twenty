import { useRecoilState } from 'recoil';

import { TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN } from '../constants';
import { isSomeInputInEditModeState } from '../states/isSomeInputInEditModeState';
import { numberOfTableColumnsState } from '../states/numberOfTableColumnsState';
import { numberOfTableRowsState } from '../states/numberOfTableRowsState';
import { softFocusPositionState } from '../states/softFocusPositionState';

export function useMoveSoftFocus() {
  const [, setSoftFocusPosition] = useRecoilState(softFocusPositionState);
  const [isSomeInputInEditMode] = useRecoilState(isSomeInputInEditModeState);

  const [numberOfTableRows] = useRecoilState(numberOfTableRowsState);
  const [numberOfTableColumns] = useRecoilState(numberOfTableColumnsState);

  function moveUp() {
    if (isSomeInputInEditMode) return;

    setSoftFocusPosition((prev) => {
      let newRowNumber = prev.row - 1;

      if (newRowNumber < 0) {
        newRowNumber = 0;
      }

      return {
        ...prev,
        row: newRowNumber,
      };
    });
  }

  function moveDown() {
    if (isSomeInputInEditMode) return;

    setSoftFocusPosition((prev) => {
      let newRowNumber = prev.row + 1;

      if (newRowNumber >= numberOfTableRows) {
        newRowNumber = numberOfTableRows - 1;
      }

      return {
        ...prev,
        row: newRowNumber,
      };
    });
  }

  function moveRight() {
    if (isSomeInputInEditMode) return;

    setSoftFocusPosition((prev) => {
      let newColumnNumber = prev.column + 1;

      if (newColumnNumber >= numberOfTableColumns) {
        newColumnNumber = numberOfTableColumns - 1;
      }

      return {
        ...prev,
        column: newColumnNumber,
      };
    });
  }

  function moveLeft() {
    if (isSomeInputInEditMode) return;

    setSoftFocusPosition((prev) => {
      let newColumnNumber = prev.column - 1;

      if (
        newColumnNumber < TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN
      ) {
        newColumnNumber = TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN;
      }

      return {
        ...prev,
        column: newColumnNumber,
      };
    });
  }

  return {
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
  };
}
