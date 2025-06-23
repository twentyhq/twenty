import { useRecoilCallback } from 'recoil';

import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useSetRecordTableFocusPosition } from '@/object-record/record-table/hooks/internal/useSetRecordTableFocusPosition';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { numberOfTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/numberOfTableColumnsComponentSelector';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';

export const useRecordTableMoveFocusedCell = (recordTableId?: string) => {
  const setFocusPosition = useSetRecordTableFocusPosition(recordTableId);

  const focusPositionState = useRecoilComponentCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const focusPosition = getSnapshotValue(snapshot, focusPositionState);

        let newRowIndex = focusPosition.row - 1;

        if (newRowIndex < 0) {
          newRowIndex = 0;
        }

        setFocusPosition({
          ...focusPosition,
          row: newRowIndex,
        });
      },
    [focusPositionState, setFocusPosition],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );
        const focusPosition = getSnapshotValue(snapshot, focusPositionState);

        let newRowIndex = focusPosition.row + 1;

        if (newRowIndex >= allRecordIds.length) {
          newRowIndex = allRecordIds.length - 1;
        }

        setFocusPosition({
          ...focusPosition,
          row: newRowIndex,
        });
      },
    [recordIndexAllRecordIdsSelector, setFocusPosition, focusPositionState],
  );

  const numberOfTableColumnsSelector = useRecoilComponentCallbackStateV2(
    numberOfTableColumnsComponentSelector,
    recordTableId,
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );
        const focusPosition = getSnapshotValue(snapshot, focusPositionState);

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const currentColumnIndex = focusPosition.column;
        const currentRowIndex = focusPosition.row;

        const isLastRowAndLastColumn =
          currentColumnIndex === numberOfTableColumns - 1 &&
          currentRowIndex === allRecordIds.length - 1;

        const isLastColumnButNotLastRow =
          currentColumnIndex === numberOfTableColumns - 1 &&
          currentRowIndex !== allRecordIds.length - 1;

        const isNotLastColumn = currentColumnIndex !== numberOfTableColumns - 1;

        if (isLastRowAndLastColumn) {
          return;
        }

        if (isNotLastColumn) {
          setFocusPosition({
            row: currentRowIndex,
            column: currentColumnIndex + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          setFocusPosition({
            row: currentRowIndex + 1,
            column: 0,
          });
        }
      },
    [
      recordIndexAllRecordIdsSelector,
      focusPositionState,
      numberOfTableColumnsSelector,
      setFocusPosition,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const focusPosition = getSnapshotValue(snapshot, focusPositionState);

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const currentColumnIndex = focusPosition.column;
        const currentRowIndex = focusPosition.row;

        const isFirstRowAndFirstColumn =
          currentColumnIndex === 0 && currentRowIndex === 0;

        const isFirstColumnButNotFirstRow =
          currentColumnIndex === 0 && currentRowIndex > 0;

        const isNotFirstColumn = currentColumnIndex > 0;

        if (isFirstRowAndFirstColumn) {
          return;
        }

        if (isNotFirstColumn) {
          setFocusPosition({
            row: currentRowIndex,
            column: currentColumnIndex - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          setFocusPosition({
            row: currentRowIndex - 1,
            column: numberOfTableColumns - 1,
          });
        }
      },
    [numberOfTableColumnsSelector, focusPositionState, setFocusPosition],
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
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    setFocusPosition,
    moveFocus,
  };
};
