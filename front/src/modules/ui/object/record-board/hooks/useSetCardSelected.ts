import { useRecoilCallback } from 'recoil';

import { actionBarOpenState } from '@/ui/navigation/action-bar/states/actionBarIsOpenState';

import { activeCardIdsScopedState } from '../states/activeCardIdsScopedState';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export const useSetCardSelected = () => {
  const setCardSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (cardId: string, selected: boolean) => {
        const activeCardIds = snapshot.getLoadable(
          activeCardIdsScopedState,
        ).contents;

        set(isCardSelectedFamilyState(cardId), selected);
        set(actionBarOpenState, selected || activeCardIds.length > 0);

        if (selected) {
          set(activeCardIdsScopedState, [...activeCardIds, cardId]);
        } else {
          set(
            activeCardIdsScopedState,
            activeCardIds.filter((id: string) => id !== cardId),
          );
        }
      },
  );

  const unselectAllActiveCards = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const activeCardIds = snapshot.getLoadable(
          activeCardIdsScopedState,
        ).contents;

        activeCardIds.forEach((cardId: string) => {
          set(isCardSelectedFamilyState(cardId), false);
        });

        set(activeCardIdsScopedState, []);
        set(actionBarOpenState, false);
      },
    [],
  );

  return {
    setCardSelected,
    unselectAllActiveCards,
  };
};
