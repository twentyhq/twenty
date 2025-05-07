import { useRecoilCallback } from 'recoil';

import { useFocusedBoardCard } from '@/object-record/record-board/hooks/useFocusedBoardCard';
import { focusedBoardCardIndexesComponentState } from '@/object-record/record-board/states/focusedBoardCardIndexesComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { useRecoilComponentFamilyValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValueV2';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

type NavigationDirection = 'up' | 'down' | 'left' | 'right';

export const useBoardCardNavigation = (recordBoardId?: string) => {
  const { focusBoardCard } = useFocusedBoardCard(recordBoardId);

  const focusedBoardCardIndexesState = useRecoilComponentCallbackStateV2(
    focusedBoardCardIndexesComponentState,
    recordBoardId,
  );

  const visibleRecordGroupIds = useRecoilComponentFamilyValueV2(
    visibleRecordGroupIdsComponentFamilySelector,
    ViewType.Kanban,
  );

  const recordIdsByGroupState = useRecoilComponentCallbackStateV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
  );

  const moveHorizontally = useRecoilCallback(
    ({ snapshot }) =>
      (direction: 'left' | 'right') => {
        const focusedBoardCardIndexes = snapshot
          .getLoadable(focusedBoardCardIndexesState)
          .getValue();

        if (!isDefined(focusedBoardCardIndexes)) {
          if (visibleRecordGroupIds.length === 0) {
            return;
          }

          const firstGroupId = visibleRecordGroupIds[0];
          const recordIdsInFirstGroup = snapshot
            .getLoadable(recordIdsByGroupState(firstGroupId))
            .getValue();

          if (
            !Array.isArray(recordIdsInFirstGroup) ||
            recordIdsInFirstGroup.length === 0
          ) {
            return;
          }

          focusBoardCard({
            columnIndex: 0,
            rowIndex: 0,
          });
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
    ],
  );

  const moveVertically = useRecoilCallback(
    ({ snapshot }) =>
      (direction: 'up' | 'down') => {
        const focusedBoardCardIndexes = snapshot
          .getLoadable(focusedBoardCardIndexesState)
          .getValue();

        if (!isDefined(focusedBoardCardIndexes)) {
          if (visibleRecordGroupIds.length === 0) return;

          const firstGroupId = visibleRecordGroupIds[0];
          const recordIdsInFirstGroup = snapshot
            .getLoadable(recordIdsByGroupState(firstGroupId))
            .getValue();

          if (
            !Array.isArray(recordIdsInFirstGroup) ||
            recordIdsInFirstGroup.length === 0
          ) {
            return;
          }

          focusBoardCard({
            columnIndex: 0,
            rowIndex: 0,
          });

          return;
        }

        if (visibleRecordGroupIds.length === 0) return;

        const currentGroupId =
          visibleRecordGroupIds[focusedBoardCardIndexes.columnIndex];
        const recordIdsInGroup = snapshot
          .getLoadable(recordIdsByGroupState(currentGroupId))
          .getValue();

        if (!Array.isArray(recordIdsInGroup) || recordIdsInGroup.length === 0) {
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
