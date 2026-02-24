import { useStore } from 'jotai';
import { useCallback } from 'react';

import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useRecoilComponentFamilySelectorValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilySelectorValueV2';
import { useRecoilComponentFamilyStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentFamilyStateCallbackStateV2';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

type NavigationDirection = 'up' | 'down' | 'left' | 'right';

export const useRecordBoardCardNavigation = (recordBoardId?: string) => {
  const store = useStore();
  const { focusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const focusedBoardCardIndexes = useRecoilComponentStateCallbackStateV2(
    focusedRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const visibleRecordGroupIds = useRecoilComponentFamilySelectorValueV2(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const recordIdsByGroupState = useRecoilComponentFamilyStateCallbackStateV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
  );

  const focusFirstAvailableRecord = useCallback(() => {
    if (visibleRecordGroupIds.length === 0) {
      return;
    }

    const firstColumnWithRecords = visibleRecordGroupIds.findIndex(
      (groupId) => {
        const recordIdsInGroup = store.get(recordIdsByGroupState(groupId));
        return Array.isArray(recordIdsInGroup) && recordIdsInGroup.length > 0;
      },
    );

    if (firstColumnWithRecords !== -1) {
      focusBoardCard({
        columnIndex: firstColumnWithRecords,
        rowIndex: 0,
      });
    }
  }, [store, visibleRecordGroupIds, recordIdsByGroupState, focusBoardCard]);

  const moveHorizontally = useCallback(
    (direction: 'left' | 'right') => {
      const currentFocusedBoardCardIndexes = store.get(focusedBoardCardIndexes);

      if (!isDefined(currentFocusedBoardCardIndexes)) {
        focusFirstAvailableRecord();
        return;
      }

      if (visibleRecordGroupIds.length === 0) {
        return;
      }

      let newColumnIndex =
        direction === 'right'
          ? currentFocusedBoardCardIndexes.columnIndex + 1
          : currentFocusedBoardCardIndexes.columnIndex - 1;

      if (newColumnIndex < 0) {
        newColumnIndex = 0;
      } else if (newColumnIndex >= visibleRecordGroupIds.length) {
        newColumnIndex = visibleRecordGroupIds.length - 1;
      }

      if (newColumnIndex === currentFocusedBoardCardIndexes.columnIndex) {
        return;
      }

      let foundColumnWithRecords = false;
      const initialColumnIndex = newColumnIndex;

      while (!foundColumnWithRecords) {
        const currentGroupId = visibleRecordGroupIds[newColumnIndex];
        const recordIdsInGroup = store.get(
          recordIdsByGroupState(currentGroupId),
        );

        if (Array.isArray(recordIdsInGroup) && recordIdsInGroup.length > 0) {
          foundColumnWithRecords = true;
        } else {
          newColumnIndex =
            direction === 'right' ? newColumnIndex + 1 : newColumnIndex - 1;

          if (
            newColumnIndex < 0 ||
            newColumnIndex >= visibleRecordGroupIds.length
          ) {
            focusFirstAvailableRecord();
            return;
          }

          if (
            (direction === 'right' && newColumnIndex <= initialColumnIndex) ||
            (direction === 'left' && newColumnIndex >= initialColumnIndex)
          ) {
            return;
          }
        }
      }

      const currentGroupId = visibleRecordGroupIds[newColumnIndex];
      const recordIdsInGroup = store.get(recordIdsByGroupState(currentGroupId));

      let newRowIndex = currentFocusedBoardCardIndexes.rowIndex;
      if (newRowIndex >= recordIdsInGroup.length) {
        newRowIndex = recordIdsInGroup.length - 1;
      }

      focusBoardCard({
        columnIndex: newColumnIndex,
        rowIndex: newRowIndex,
      });
    },
    [
      store,
      focusedBoardCardIndexes,
      visibleRecordGroupIds,
      recordIdsByGroupState,
      focusBoardCard,
      focusFirstAvailableRecord,
    ],
  );

  const moveVertically = useCallback(
    (direction: 'up' | 'down') => {
      const currentFocusedBoardCardIndexes = store.get(focusedBoardCardIndexes);

      if (!isDefined(currentFocusedBoardCardIndexes)) {
        focusFirstAvailableRecord();
        return;
      }

      if (visibleRecordGroupIds.length === 0) return;

      const currentGroupId =
        visibleRecordGroupIds[currentFocusedBoardCardIndexes.columnIndex];
      const recordIdsInGroup = store.get(recordIdsByGroupState(currentGroupId));

      if (!Array.isArray(recordIdsInGroup) || recordIdsInGroup.length === 0) {
        focusFirstAvailableRecord();
        return;
      }

      let newRowIndex =
        direction === 'down'
          ? currentFocusedBoardCardIndexes.rowIndex + 1
          : currentFocusedBoardCardIndexes.rowIndex - 1;

      if (newRowIndex < 0) {
        newRowIndex = 0;
      } else if (newRowIndex >= recordIdsInGroup.length) {
        newRowIndex = recordIdsInGroup.length - 1;
      }

      if (newRowIndex === currentFocusedBoardCardIndexes.rowIndex) {
        return;
      }

      focusBoardCard({
        columnIndex: currentFocusedBoardCardIndexes.columnIndex,
        rowIndex: newRowIndex,
      });
    },
    [
      store,
      focusedBoardCardIndexes,
      visibleRecordGroupIds,
      recordIdsByGroupState,
      focusBoardCard,
      focusFirstAvailableRecord,
    ],
  );

  const move = (direction: NavigationDirection) => {
    if (direction === 'left' || direction === 'right') {
      moveHorizontally(direction);
    } else if (direction === 'up' || direction === 'down') {
      moveVertically(direction);
    }
  };

  return {
    move,
  };
};
