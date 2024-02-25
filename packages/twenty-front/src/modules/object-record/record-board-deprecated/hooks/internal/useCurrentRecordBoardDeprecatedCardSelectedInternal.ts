import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { useRecordBoardDeprecatedScopedStates } from '@/object-record/record-board-deprecated/hooks/internal/useRecordBoardDeprecatedScopedStates';
import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

import { BoardCardIdContext } from '../../contexts/BoardCardIdContext';
import { isRecordBoardDeprecatedCardSelectedFamilyState } from '../../states/isRecordBoardDeprecatedCardSelectedFamilyState';

export const useCurrentRecordBoardDeprecatedCardSelectedInternal = () => {
  const currentCardId = useContext(BoardCardIdContext);

  const isCurrentCardSelected = useRecoilValue(
    isRecordBoardDeprecatedCardSelectedFamilyState(currentCardId ?? ''),
  );

  const { activeCardIdsState } = useRecordBoardDeprecatedScopedStates();

  const setActiveCardIds = useSetRecoilState(activeCardIdsState);

  const setCurrentCardSelected = useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        if (!currentCardId) return;

        set(
          isRecordBoardDeprecatedCardSelectedFamilyState(currentCardId),
          selected,
        );
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
