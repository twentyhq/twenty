import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useRecordBoardScopedStates } from '@/object-record/record-board/hooks/internal/useRecordBoardScopedStates';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

import { BoardCardIdContext } from '../../contexts/BoardCardIdContext';
import { isRecordBoardCardSelectedFamilyState } from '../../states/isRecordBoardCardSelectedFamilyState';

export const useCurrentRecordBoardCardSelectedInternal = () => {
  const currentCardId = useContext(BoardCardIdContext);

  const isCurrentCardSelected = useRecoilValue(
    isRecordBoardCardSelectedFamilyState(currentCardId ?? ''),
  );

  const { activeCardIdsState } = useRecordBoardScopedStates();

  const setActiveCardIds = useSetRecoilState(activeCardIdsState);

  const setCurrentCardSelected = useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        if (!currentCardId) return;

        set(isRecordBoardCardSelectedFamilyState(currentCardId), selected);
        set(actionBarOpenState, selected);

        if (selected) {
          setActiveCardIds((prevActiveCardIds) => [
            ...prevActiveCardIds,
            currentCardId,
          ]);
        } else {
          setActiveCardIds((prevActiveCardIds) =>
            prevActiveCardIds.filter((id) => id !== currentCardId),
          );
        }
      },
    [currentCardId, setActiveCardIds],
  );

  return {
    isCurrentCardSelected,
    setCurrentCardSelected,
  };
};
