import { useCallback } from 'react';

import { type MoveFocusDirection } from '@/object-record/record-table/types/MoveFocusDirection';

import { currentRecordFieldsComponentState } from '@/object-record/record-field/states/currentRecordFieldsComponentState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { useFocusRecordTableCell } from '@/object-record/record-table/record-table-cell/hooks/useFocusRecordTableCell';
import { recordTableFocusPositionComponentState } from '@/object-record/record-table/states/recordTableFocusPositionComponentState';
import { useRecoilComponentSelectorCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentSelectorCallbackStateV2';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

export const useRecordTableMoveFocusedCell = (recordTableId?: string) => {
  const { focusRecordTableCell } = useFocusRecordTableCell(recordTableId);

  const focusPositionAtom = useRecoilComponentStateCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIdsAtom = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveUp = useCallback(() => {
    const focusPosition = store.get(focusPositionAtom);

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
  }, [store, focusPositionAtom, focusRecordTableCell]);

  const moveDown = useCallback(() => {
    const allRecordIds = store.get(recordIndexAllRecordIdsAtom);
    const focusPosition = store.get(focusPositionAtom);

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
  }, [
    recordIndexAllRecordIdsAtom,
    focusRecordTableCell,
    focusPositionAtom,
    store,
  ]);

  const currentRecordFieldsAtom = useRecoilComponentStateCallbackStateV2(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const moveRight = useCallback(() => {
    const allRecordIds = store.get(recordIndexAllRecordIdsAtom);

    const focusPosition = store.get(focusPositionAtom);

    if (!isDefined(focusPosition)) {
      return;
    }

    const numberOfRecordFields = store.get(currentRecordFieldsAtom).length;

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
  }, [
    recordIndexAllRecordIdsAtom,
    store,
    focusPositionAtom,
    currentRecordFieldsAtom,
    focusRecordTableCell,
  ]);

  const moveLeft = useCallback(() => {
    const focusPosition = store.get(focusPositionAtom);

    if (!isDefined(focusPosition)) {
      return;
    }

    const numberOfRecordFields = store.get(currentRecordFieldsAtom).length;

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
  }, [currentRecordFieldsAtom, focusPositionAtom, focusRecordTableCell, store]);

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
