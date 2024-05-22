import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { useSetSoftFocusPosition } from './internal/useSetSoftFocusPosition';

export const useRecordTableMoveFocus = (recordTableId?: string) => {
  const {
    scopeId,
    softFocusPositionState,
    numberOfTableRowsState,
    numberOfTableColumnsSelector,
    selectedRowIdsSelector,
  } = useRecordTableStates(recordTableId);

  const setSoftFocusPosition = useSetSoftFocusPosition(recordTableId);

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        let newRowNumber = softFocusPosition.row - 1;

        if (newRowNumber < 0) {
          newRowNumber = 0;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [softFocusPositionState, setSoftFocusPosition],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          numberOfTableRowsState,
        );

        let newRowNumber = softFocusPosition.row + 1;

        if (newRowNumber >= numberOfTableRows) {
          newRowNumber = numberOfTableRows - 1;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowNumber,
        });
      },
    [numberOfTableRowsState, setSoftFocusPosition, softFocusPositionState],
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector(),
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          numberOfTableRowsState,
        );

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
            column: 0,
          });
        }
      },
    [
      softFocusPositionState,
      numberOfTableColumnsSelector,
      numberOfTableRowsState,
      setSoftFocusPosition,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector(),
        );

        const currentColumnNumber = softFocusPosition.column;
        const currentRowNumber = softFocusPosition.row;

        const isFirstRowAndFirstColumn =
          currentColumnNumber === 0 && currentRowNumber === 0;

        const isFirstColumnButNotFirstRow =
          currentColumnNumber === 0 && currentRowNumber > 0;

        const isNotFirstColumn = currentColumnNumber > 0;

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
    [
      numberOfTableColumnsSelector,
      softFocusPositionState,
      setSoftFocusPosition,
    ],
  );

  const moveFocus = (direction: MoveFocusDirection) => {
    switch (direction) {
      case 'up':
        moveUp();
        break;
      case 'down':
        moveDown();
        break;
      case 'left':
        moveLeft();
        break;
      case 'right':
        moveRight();
        break;
    }
  };

  return {
    scopeId,
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    setSoftFocusPosition,
    selectedRowIdsSelector,
    moveFocus,
  };
};
