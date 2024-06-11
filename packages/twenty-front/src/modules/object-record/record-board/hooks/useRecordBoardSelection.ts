import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';

export const useRecordBoardSelection = (recordBoardId?: string) => {
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);
  const { selectedRecordIdsSelector, isRecordBoardCardSelectedFamilyState } =
    useRecordBoardStates(recordBoardId);

  const resetRecordSelection = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        setContextMenuOpenState(false);
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
      setContextMenuOpenState,
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
