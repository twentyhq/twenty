import { useRecoilCallback } from 'recoil';

import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';

import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableMoveFocusedCell = (recordTableId?: string) => {
  const { focusRecordTableCell } = useFocusRecordTableCell(recordTableId);

  const focusPositionState = useRecoilComponentCallbackState(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackState(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const focusPosition = getSnapshotValue(snapshot, focusPositionState);

        if (!isDefined(focusPosition)) {
          return;
        }

        let newRowIndex = focusPosition.row - 1;

        if (newRowIndex < 0) {
          newRowIndex = 0;
        }

        focusRecordTableCell({
          ...focusPosition,
          row: newRowIndex,
        });
      },
    [focusPositionState, focusRecordTableCell],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );
        const focusPosition = getSnapshotValue(snapshot, focusPositionState);

        if (!isDefined(focusPosition)) {
          return;
        }

        let newRowIndex = focusPosition.row + 1;

        if (newRowIndex >= allRecordIds.length) {
          newRowIndex = allRecordIds.length - 1;
        }

        focusRecordTableCell({
          ...focusPosition,
          row: newRowIndex,
        });
      },
    [recordIndexAllRecordIdsSelector, focusRecordTableCell, focusPositionState],
  );

  const currentRecordFieldsCallbackState = useRecoilComponentCallbackState(
    currentRecordFieldsComponentState,
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

        if (!isDefined(focusPosition)) {
          return;
        }

        const numberOfRecordFields = getSnapshotValue(
          snapshot,
          currentRecordFieldsCallbackState,
        ).length;

        const currentColumnIndex = focusPosition.column;
        const currentRowIndex = focusPosition.row;

        const isLastRowAndLastColumn =
          currentColumnIndex === numberOfRecordFields - 1 &&
          currentRowIndex === allRecordIds.length - 1;

        const isLastColumnButNotLastRow =
          currentColumnIndex === numberOfRecordFields - 1 &&
          currentRowIndex !== allRecordIds.length - 1;

        const isNotLastColumn = currentColumnIndex !== numberOfRecordFields - 1;

        if (isLastRowAndLastColumn) {
          return;
        }

        if (isNotLastColumn) {
          focusRecordTableCell({
            row: currentRowIndex,
            column: currentColumnIndex + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          focusRecordTableCell({
            row: currentRowIndex + 1,
            column: 0,
          });
        }
      },
    [
      recordIndexAllRecordIdsSelector,
      focusPositionState,
      currentRecordFieldsCallbackState,
      focusRecordTableCell,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const focusPosition = getSnapshotValue(snapshot, focusPositionState);

        if (!isDefined(focusPosition)) {
          return;
        }

        const numberOfRecordFields = getSnapshotValue(
          snapshot,
          currentRecordFieldsCallbackState,
        ).length;

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
          focusRecordTableCell({
            row: currentRowIndex,
            column: currentColumnIndex - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          focusRecordTableCell({
            row: currentRowIndex - 1,
            column: numberOfRecordFields - 1,
          });
        }
      },
    [
      currentRecordFieldsCallbackState,
      focusPositionState,
      focusRecordTableCell,
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
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    moveFocus,
  };
};
