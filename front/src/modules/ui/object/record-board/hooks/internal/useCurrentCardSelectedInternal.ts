import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';
import { useRecordBoardScopedStates } from '@/ui/object/record-board/hooks/internal/useRecordBoardScopedStates';

import { BoardCardIdContext } from '../../contexts/BoardCardIdContext';
import { isCardSelectedFamilyState } from '../../states/isCardSelectedFamilyState';

export const useCurrentCardSelectedInternal = () => {
  const currentCardId = useContext(BoardCardIdContext);

  const isCurrentCardSelected = useRecoilValue(
    isCardSelectedFamilyState(currentCardId ?? ''),
  );

  const { activeCardIdsState } = useRecordBoardScopedStates();

  const setActiveCardIds = useSetRecoilState(activeCardIdsState);

  const setCurrentCardSelected = useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        if (!currentCardId) return;

        set(isCardSelectedFamilyState(currentCardId), selected);
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
