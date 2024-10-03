import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { actionMenuDropdownIsOpenState } from '@/action-menu/states/actionMenuDropdownIsOpenState';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';

export const useRecordBoardSelection = (recordBoardId?: string) => {
  const setActionMenuDropdownOpenState = useSetRecoilState(
    actionMenuDropdownIsOpenState,
  );
  const { selectedRecordIdsSelector, isRecordBoardCardSelectedFamilyState } =
    useRecordBoardStates(recordBoardId);

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        setActionMenuDropdownOpenState(false);
        const recordIds = snapshot
          .getLoadable(selectedRecordIdsSelector())
          .getValue();

        for (const recordId of recordIds) {
          set(isRecordBoardCardSelectedFamilyState(recordId), false);
        }
      },
    [
      selectedRecordIdsSelector,
      isRecordBoardCardSelectedFamilyState,
      setActionMenuDropdownOpenState,
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
