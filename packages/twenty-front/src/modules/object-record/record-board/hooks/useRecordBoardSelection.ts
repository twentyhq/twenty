import { useRecoilCallback } from 'recoil';

import { getActionMenuDropdownIdFromActionMenuId } from '@/action-menu/utils/getActionMenuDropdownIdFromActionMenuId';
import { getActionMenuIdFromRecordIndexId } from '@/action-menu/utils/getActionMenuIdFromRecordIndexId';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';

export const useRecordBoardSelection = (recordBoardId: string) => {
  const { selectedRecordIdsSelector, isRecordBoardCardSelectedFamilyState } =
    useRecordBoardStates(recordBoardId);

  const isActionMenuDropdownOpenState = extractComponentState(
    isDropdownOpenComponentState,
    getActionMenuDropdownIdFromActionMenuId(
      getActionMenuIdFromRecordIndexId(recordBoardId),
    ),
  );

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        set(isActionMenuDropdownOpenState, false);

        const recordIds = snapshot
          .getLoadable(selectedRecordIdsSelector())
          .getValue();

        for (const recordId of recordIds) {
          set(isRecordBoardCardSelectedFamilyState(recordId), false);
        }
      },
    [
      isActionMenuDropdownOpenState,
      selectedRecordIdsSelector,
      isRecordBoardCardSelectedFamilyState,
    ],
  );

  const setRecordAsSelected = useRecoilCallback(
    ({ snapshot, set }) =>
      (recordId: string, isSelected: boolean) => {
        const isRecordCurrentlySelected = snapshot
          .getLoadable(isRecordBoardCardSelectedFamilyState(recordId))
          .getValue();

        if (isRecordCurrentlySelected === isSelected) {
          return;
        }

        set(isRecordBoardCardSelectedFamilyState(recordId), isSelected);
      },
    [isRecordBoardCardSelectedFamilyState],
  );

  return { resetRecordSelection, setRecordAsSelected };
};
