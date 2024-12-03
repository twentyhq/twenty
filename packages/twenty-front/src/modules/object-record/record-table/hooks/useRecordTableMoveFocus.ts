import { useRecoilCallback } from 'recoil';

import { MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';
import { getSnapshotValue } from '@/ui/utilities/recoil-scope/utils/getSnapshotValue';

import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { numberOfTableColumnsComponentSelector } from '@/object-record/record-table/states/selectors/numberOfTableColumnsComponentSelector';
import { softFocusPositionComponentState } from '@/object-record/record-table/states/softFocusPositionComponentState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useSetSoftFocusPosition } from './internal/useSetSoftFocusPosition';

export const useRecordTableMoveFocus = (recordTableId?: string) => {
  const setSoftFocusPosition = useSetSoftFocusPosition(recordTableId);

  const softFocusPositionState = useRecoilComponentCallbackStateV2(
    softFocusPositionComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsSelector = useRecoilComponentCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const moveUp = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        let newRowIndex = softFocusPosition.row - 1;

        if (newRowIndex < 0) {
          newRowIndex = 0;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowIndex,
        });
      },
    [softFocusPositionState, setSoftFocusPosition],
  );

  const moveDown = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        let newRowIndex = softFocusPosition.row + 1;

        if (newRowIndex >= allRecordIds.length) {
          newRowIndex = allRecordIds.length - 1;
        }

        setSoftFocusPosition({
          ...softFocusPosition,
          row: newRowIndex,
        });
      },
    [
      recordIndexAllRecordIdsSelector,
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
        const allRecordIds = getSnapshotValue(
          snapshot,
          recordIndexAllRecordIdsSelector,
        );
        const softFocusPosition = getSnapshotValue(
          snapshot,
          softFocusPositionState,
        );

        const numberOfTableColumns = getSnapshotValue(
          snapshot,
          numberOfTableColumnsSelector,
        );

        const currentColumnIndex = softFocusPosition.column;
        const currentRowIndex = softFocusPosition.row;

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
          setSoftFocusPosition({
            row: currentRowIndex,
            column: currentColumnIndex + 1,
          });
        } else if (isLastColumnButNotLastRow) {
          setSoftFocusPosition({
            row: currentRowIndex + 1,
            column: 0,
          });
        }
      },
    [
      recordIndexAllRecordIdsSelector,
      softFocusPositionState,
      numberOfTableColumnsSelector,
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
          numberOfTableColumnsSelector,
        );

        const currentColumnIndex = softFocusPosition.column;
        const currentRowIndex = softFocusPosition.row;

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
            row: currentRowIndex,
            column: currentColumnIndex - 1,
          });
        } else if (isFirstColumnButNotFirstRow) {
          setSoftFocusPosition({
            row: currentRowIndex - 1,
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
    moveDown,
    moveLeft,
    moveRight,
    moveUp,
    setSoftFocusPosition,
    moveFocus,
  };
};
