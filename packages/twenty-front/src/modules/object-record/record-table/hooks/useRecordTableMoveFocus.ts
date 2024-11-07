import { useRecoilCallback } from 'recoil';

import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { numberOfTableRowsComponentState } from '@/object-record/record-table/states/numberOfTableRowsComponentState';
import { numberOfTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/numberOfTableColumnsComponentSelector';
import { tableAllRowIdsComponentSelector } from '@/object-record/record-table/states/selectors/tableAllRowIdsComponentSelector';
import { softFocusPositionComponentState } from '@/object-record/record-table/states/softFocusPositionComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetSoftFocusPosition } from './internal/useSetSoftFocusPosition';

export const useRecordTableMoveFocus = (recordTableId?: string) => {
  const setSoftFocusPosition = useSetSoftFocusPosition(recordTableId);

  const softFocusPositionState = useRecoilComponentCallbackStateV2(
    softFocusPositionComponentState,
    recordTableId,
  );

  const tableAllRowIdsState = useRecoilComponentCallbackStateV2(
    tableAllRowIdsComponentSelector,
    recordTableId,
  );

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const rowIds = getSnapshotValue(snapshot, tableAllRowIdsState);
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const currentRowIndex = rowIds.indexOf(softFocusPosition.recordId);

        let newRowIndex = currentRowIndex - 1;

        if (newRowIndex < 0) {
          newRowIndex = 0;
        }

        console.log('moveUp: ', {
          rowIds,
          softFocusPosition,
          currentRowIndex,
          newRowIndex,
        });

        setSoftFocusPosition({
          ...softFocusPosition,
          recordId: rowIds[newRowIndex],
        });
      },
    [tableAllRowIdsState, softFocusPositionState, setSoftFocusPosition],
  );

  const numberOfTableRowsState = useRecoilComponentCallbackStateV2(
    numberOfTableRowsComponentState,
    recordTableId,
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const rowIds = getSnapshotValue(snapshot, tableAllRowIdsState);
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          numberOfTableRowsState,
        );

        const currentRowIndex = rowIds.indexOf(softFocusPosition.recordId);

        let newRowIndex = currentRowIndex + 1;

        if (newRowIndex >= numberOfTableRows) {
          newRowIndex = numberOfTableRows - 1;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          recordId: rowIds[newRowIndex],
        });
      },
    [
      tableAllRowIdsState,
      numberOfTableRowsState,
      setSoftFocusPosition,
      softFocusPositionState,
    ],
  );

  const numberOfTableColumnsSelector = useRecoilComponentCallbackStateV2(
    numberOfTableColumnsComponentSelector,
    recordTableId,
  );

  const moveRight = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const rowIds = getSnapshotValue(snapshot, tableAllRowIdsState);
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const numberOfTableRows = getSnapshotValue(
          snapshot,
          numberOfTableRowsState,
        );

        const currentColumnIndex = softFocusPosition.column;
        const currentRowIndex = rowIds.indexOf(softFocusPosition.recordId);

        const isLastRowAndLastColumn =
          currentColumnIndex === numberOfTableColumns - 1 &&
          currentRowIndex === numberOfTableRows - 1;

        const isLastColumnButNotLastRow =
          currentColumnIndex === numberOfTableColumns - 1 &&
          currentRowIndex !== numberOfTableRows - 1;

        const isNotLastColumn = currentColumnIndex !== numberOfTableColumns - 1;

        if (isLastRowAndLastColumn) {
          return;
        }

        if (isNotLastColumn) {
          setSoftFocusPosition({
            recordId: rowIds[currentRowIndex],
            column: currentColumnIndex + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          setSoftFocusPosition({
            recordId: rowIds[currentRowIndex + 1],
            column: 0,
          });
        }
      },
    [
      tableAllRowIdsState,
      softFocusPositionState,
      numberOfTableColumnsSelector,
      numberOfTableRowsState,
      setSoftFocusPosition,
    ],
  );

  const moveLeft = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const rowIds = getSnapshotValue(snapshot, tableAllRowIdsState);
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const currentColumnIndex = softFocusPosition.column;
        const currentRowIndex = rowIds.indexOf(softFocusPosition.recordId);

        const isFirstRowAndFirstColumn =
          currentColumnIndex === 0 && currentRowIndex === 0;

        const isFirstColumnButNotFirstRow =
          currentColumnIndex === 0 && currentRowIndex > 0;

        const isNotFirstColumn = currentColumnIndex > 0;

        if (isFirstRowAndFirstColumn) {
          return;
        }

        if (isNotFirstColumn) {
          setSoftFocusPosition({
            recordId: rowIds[currentRowIndex],
            column: currentColumnIndex - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          setSoftFocusPosition({
            recordId: rowIds[currentRowIndex - 1],
            column: numberOfTableColumns - 1,
          });
        }
      },
    [
      tableAllRowIdsState,
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
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    setSoftFocusPosition,
    moveFocus,
  };
};
