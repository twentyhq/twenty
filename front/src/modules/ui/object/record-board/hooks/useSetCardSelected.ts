import { useRecoilCallback } from 'recoil';

import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

import { activeCardIdsState } from '../states/activeCardIdsState';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export const useSetCardSelected = () => {
  const setCardSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (cardId: string, selected: boolean) => {
        const activeCardIds = snapshot.getLoadable(activeCardIdsState).contents;

        set(isCardSelectedFamilyState(cardId), selected);
        set(actionBarOpenState, selected || activeCardIds.length > 0);

        if (selected) {
          set(activeCardIdsState, [...activeCardIds, cardId]);
        } else {
          set(
            activeCardIdsState,
            activeCardIds.filter((id: string) => id !== cardId),
          );
        }
      },
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
    setCardSelected,
    unselectAllActiveCards,
  };
};
