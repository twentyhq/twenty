import { useRecoilCallback } from 'recoil';

import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { focusedRecordBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedRecordBoardCardIndexesComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

type NavigationDirection = 'up' | 'down' | 'left' | 'right';

export const useRecordBoardCardNavigation = (recordBoardId?: string) => {
  const { focusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const focusedBoardCardIndexesState = useRecoilComponentCallbackState(
    focusedRecordBoardCardIndexesComponentState,
    recordBoardId,
  );

  const visibleRecordGroupIds = useRecoilComponentFamilyValue(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const recordIdsByGroupState = useRecoilComponentCallbackState(
    recordIndexRecordIdsByGroupComponentFamilyState,
  );

  const focusFirstAvailableRecord = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        if (visibleRecordGroupIds.length === 0) {
          return;
        }

        const firstColumnWithRecords = visibleRecordGroupIds.findIndex(
          (groupId) => {
            const recordIdsInGroup = snapshot
              .getLoadable(recordIdsByGroupState(groupId))
              .getValue();
            return (
              Array.isArray(recordIdsInGroup) && recordIdsInGroup.length > 0
            );
          },
        );

        if (firstColumnWithRecords !== -1) {
          focusBoardCard({
            columnIndex: firstColumnWithRecords,
            rowIndex: 0,
          });
        }
      },
    [visibleRecordGroupIds, recordIdsByGroupState, focusBoardCard],
  );

  const moveHorizontally = useRecoilCallback(
    ({ snapshot }) =>
      (direction: 'left' | 'right') => {
        const focusedBoardCardIndexes = snapshot
          .getLoadable(focusedBoardCardIndexesState)
          .getValue();

        if (!isDefined(focusedBoardCardIndexes)) {
          focusFirstAvailableRecord();
          return;
        }

        if (visibleRecordGroupIds.length === 0) {
          return;
        }

        let newColumnIndex =
          direction === 'right'
            ? focusedBoardCardIndexes.columnIndex + 1
            : focusedBoardCardIndexes.columnIndex - 1;

        if (newColumnIndex < 0) {
          newColumnIndex = 0;
        } else if (newColumnIndex >= visibleRecordGroupIds.length) {
          newColumnIndex = visibleRecordGroupIds.length - 1;
        }

        if (newColumnIndex === focusedBoardCardIndexes.columnIndex) {
          return;
        }

        let foundColumnWithRecords = false;
        const initialColumnIndex = newColumnIndex;

        while (!foundColumnWithRecords) {
          const currentGroupId = visibleRecordGroupIds[newColumnIndex];
          const recordIdsInGroup = snapshot
            .getLoadable(recordIdsByGroupState(currentGroupId))
            .getValue();

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
        const recordIdsInGroup = snapshot
          .getLoadable(recordIdsByGroupState(currentGroupId))
          .getValue();

        let newRowIndex = focusedBoardCardIndexes.rowIndex;
        if (newRowIndex >= recordIdsInGroup.length) {
          newRowIndex = recordIdsInGroup.length - 1;
        }

        focusBoardCard({
          columnIndex: newColumnIndex,
          rowIndex: newRowIndex,
        });
      },
    [
      focusedBoardCardIndexesState,
      visibleRecordGroupIds,
      recordIdsByGroupState,
      focusBoardCard,
      focusFirstAvailableRecord,
    ],
  );

  const moveVertically = useRecoilCallback(
    ({ snapshot }) =>
      (direction: 'up' | 'down') => {
        const focusedBoardCardIndexes = snapshot
          .getLoadable(focusedBoardCardIndexesState)
          .getValue();

        if (!isDefined(focusedBoardCardIndexes)) {
          focusFirstAvailableRecord();
          return;
        }

        if (visibleRecordGroupIds.length === 0) return;

        const currentGroupId =
          visibleRecordGroupIds[focusedBoardCardIndexes.columnIndex];
        const recordIdsInGroup = snapshot
          .getLoadable(recordIdsByGroupState(currentGroupId))
          .getValue();

        if (!Array.isArray(recordIdsInGroup) || recordIdsInGroup.length === 0) {
          focusFirstAvailableRecord();
          return;
        }

        let newRowIndex =
          direction === 'down'
            ? focusedBoardCardIndexes.rowIndex + 1
            : focusedBoardCardIndexes.rowIndex - 1;

        if (newRowIndex < 0) {
          newRowIndex = 0;
        } else if (newRowIndex >= recordIdsInGroup.length) {
          newRowIndex = recordIdsInGroup.length - 1;
        }

        if (newRowIndex === focusedBoardCardIndexes.rowIndex) {
          return;
        }

        focusBoardCard({
          columnIndex: focusedBoardCardIndexes.columnIndex,
          rowIndex: newRowIndex,
        });
      },
    [
      focusedBoardCardIndexesState,
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
