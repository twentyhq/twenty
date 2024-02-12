import { useRecoilCallback } from 'recoil';

import { useRecordTableStates } from '@/object-record/record-table/hooks/internal/useRecordTableStates';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { useSetSoftFocusPosition } from './internal/useSetSoftFocusPosition';

export const useRecordTableMoveFocus = (recordTableId?: string) => {
  const {
    scopeId,
    getSoftFocusPositionState,
    getNumberOfTableRowsState,
    getNumberOfTableColumnsSelector,
    getSelectedRowIdsSelector,
  } = useRecordTableStates(recordTableId);

  const setSoftFocusPosition = useSetSoftFocusPosition(recordTableId);

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
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
    [getSoftFocusPositionState, setSoftFocusPosition],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          getNumberOfTableRowsState(),
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
    [
      getNumberOfTableRowsState,
      setSoftFocusPosition,
      getSoftFocusPositionState,
    ],
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          getNumberOfTableColumnsSelector(),
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          getNumberOfTableRowsState(),
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
      getSoftFocusPositionState,
      getNumberOfTableColumnsSelector,
      getNumberOfTableRowsState,
      setSoftFocusPosition,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          getSoftFocusPositionState(),
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          getNumberOfTableColumnsSelector(),
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
      getNumberOfTableColumnsSelector,
      getSoftFocusPositionState,
      setSoftFocusPosition,
    ],
  );

  return {
    scopeId,
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    setSoftFocusPosition,
    getSelectedRowIdsSelector,
  };
};
