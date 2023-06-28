import { useRecoilCallback } from 'recoil';

import { TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN } from '../constants';
import { numberOfTableColumnsSelectorState } from '../states/numberOfTableColumnsSelectorState';
import { numberOfTableRowsSelectorState } from '../states/numberOfTableRowsSelectorState';
import { softFocusPositionState } from '../states/softFocusPositionState';

import { useSetSoftFocusPosition } from './useSetSoftFocusPosition';

// TODO: stories
export function useMoveSoftFocus() {
  const setSoftFocusPosition = useSetSoftFocusPosition();

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        let newRowNumber = softFocusPosition.row - 1;

        if (newRowNumber < 0) {
          newRowNumber = 0;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [setSoftFocusPosition],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        const numberOfTableRows = snapshot
          .getLoadable(numberOfTableRowsSelectorState)
          .valueOrThrow();

        let newRowNumber = softFocusPosition.row + 1;

        if (newRowNumber >= numberOfTableRows) {
          newRowNumber = numberOfTableRows - 1;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [setSoftFocusPosition],
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        const numberOfTableColumns = snapshot
          .getLoadable(numberOfTableColumnsSelectorState)
          .valueOrThrow();

        const numberOfTableRows = snapshot
          .getLoadable(numberOfTableRowsSelectorState)
          .valueOrThrow();

        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isLastRowAndLastColumn =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber === numberOfTableRows - 1;

        const isLastColumnButNotLastRow =
          currentColumnNumber === numberOfTableColumns - 1 &&
          currentRowNumber !== numberOfTableRows - 1;

        const isNotLastColumn =
          currentColumnNumber !== numberOfTableColumns - 1;

        if (isLastRowAndLastColumn) {
          return;
        }

        if (isNotLastColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          setSoftFocusPosition({
            row: currentRowNumber + 1,
            column: TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN,
          });
        }
      },
    [setSoftFocusPosition],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = snapshot
          .getLoadable(softFocusPositionState)
          .valueOrThrow();

        const numberOfTableColumns = snapshot
          .getLoadable(numberOfTableColumnsSelectorState)
          .valueOrThrow();

        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isFirstRowAndFirstColumn =
          currentColumnNumber ===
            TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN &&
          currentRowNumber === 0;

        const isFirstColumnButNotFirstRow =
          currentColumnNumber ===
            TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN &&
          currentRowNumber > 0;

        const isNotFirstColumn =
          currentColumnNumber >
          TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN;

        if (isFirstRowAndFirstColumn) {
          return;
        }

        if (isNotFirstColumn) {
          setSoftFocusPosition({
            row: currentRowNumber,
            column: currentColumnNumber - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          setSoftFocusPosition({
            row: currentRowNumber - 1,
            column: numberOfTableColumns - 1,
          });
        }
      },
    [setSoftFocusPosition, TABLE_MIN_COLUMN_NUMBER_BECAUSE_OF_CHECKBOX_COLUMN],
  );

  return {
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
  };
}
