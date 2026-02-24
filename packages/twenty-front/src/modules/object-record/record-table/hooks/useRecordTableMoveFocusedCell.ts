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

  const focusPosition = useRecoilComponentStateCallbackStateV2(
    recordTableFocusPositionComponentState,
    recordTableId,
  );

  const recordIndexAllRecordIds = useRecoilComponentSelectorCallbackStateV2(
    recordIndexAllRecordIdsComponentSelector,
    recordTableId,
  );

  const store = useStore();

  const moveUp = useCallback(() => {
    const currentFocusPosition = store.get(focusPosition);

    if (!isDefined(currentFocusPosition)) {
      return;
    }

    let newRowIndex = currentFocusPosition.row - 1;

    if (newRowIndex < 0) {
      newRowIndex = 0;
    }

    focusRecordTableCell({
      ...currentFocusPosition,
      row: newRowIndex,
    });
  }, [store, focusPosition, focusRecordTableCell]);

  const moveDown = useCallback(() => {
    const allRecordIds = store.get(recordIndexAllRecordIds);
    const currentFocusPosition = store.get(focusPosition);

    if (!isDefined(currentFocusPosition)) {
      return;
    }

    let newRowIndex = currentFocusPosition.row + 1;

    if (newRowIndex >= allRecordIds.length) {
      newRowIndex = allRecordIds.length - 1;
    }

    focusRecordTableCell({
      ...currentFocusPosition,
      row: newRowIndex,
    });
  }, [recordIndexAllRecordIds, focusRecordTableCell, focusPosition, store]);

  const currentRecordFields = useRecoilComponentStateCallbackStateV2(
    currentRecordFieldsComponentState,
    recordTableId,
  );

  const moveRight = useCallback(() => {
    const allRecordIds = store.get(recordIndexAllRecordIds);

    const currentFocusPosition = store.get(focusPosition);

    if (!isDefined(currentFocusPosition)) {
      return;
    }

    const numberOfRecordFields = store.get(currentRecordFields).length;

    const currentColumnIndex = currentFocusPosition.column;
    const currentRowIndex = currentFocusPosition.row;

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
    recordIndexAllRecordIds,
    store,
    focusPosition,
    currentRecordFields,
    focusRecordTableCell,
  ]);

  const moveLeft = useCallback(() => {
    const currentFocusPosition = store.get(focusPosition);

    if (!isDefined(currentFocusPosition)) {
      return;
    }

    const numberOfRecordFields = store.get(currentRecordFields).length;

    const currentColumnIndex = currentFocusPosition.column;
    const currentRowIndex = currentFocusPosition.row;

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
  }, [currentRecordFields, focusPosition, focusRecordTableCell, store]);

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
