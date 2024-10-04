import { useRecoilCallback } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';

export const useRecordBoardSelection = (recordBoardId?: string) => {
  const { closeDropdown: closeActionMenuDropdown } = useDropdown(
    'action-menu-dropdown',
  );
  const { selectedRecordIdsSelector, isRecordBoardCardSelectedFamilyState } =
    useRecordBoardStates(recordBoardId);

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        closeActionMenuDropdown();
        const recordIds = snapshot
          .getLoadable(selectedRecordIdsSelector())
          .getValue();

        for (const recordId of recordIds) {
          set(isRecordBoardCardSelectedFamilyState(recordId), false);
        }
      },
    [
      closeActionMenuDropdown,
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
