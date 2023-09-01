import { useContext } from 'react';
import { useRecoilCallback, useRecoilState, useRecoilValue } from 'recoil';

import { actionBarOpenState } from '@/ui/action-bar/states/actionBarIsOpenState';

import { BoardCardIdContext } from '../contexts/BoardCardIdContext';
import { activeCardIdsState } from '../states/activeCardIdsState';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useCurrentCardSelected() {
  const currentCardId = useContext(BoardCardIdContext);

  const isCardSelected = useRecoilValue(
    isCardSelectedFamilyState(currentCardId ?? ''),
  );

  const [_, setActiveCardIds] = useRecoilState(activeCardIdsState);

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

  const unselectAllActiveCards = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const activeCardIds = snapshot.getLoadable(activeCardIdsState).contents;

        activeCardIds.forEach((cardId: string) => {
          set(isCardSelectedFamilyState(cardId), false);
        });

        set(activeCardIdsState, []);
        set(actionBarOpenState, false);
      },
    [],
  );

  return {
    currentCardSelected: isCardSelected,
    setCurrentCardSelected,
    unselectAllActiveCards,
  };
}
