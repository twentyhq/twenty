import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { actionBarOpenState } from '@/ui/action-bar/states/actionBarIsOpenState';

import { activeCardIdsState } from '../states/activeCardIdsState';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useSetCardSelected() {
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);

  return useRecoilCallback(
    ({ set, snapshot }) =>
      (cardId: string, selected: boolean) => {
        const activeCardIds = snapshot.getLoadable(activeCardIdsState).contents;

        set(isCardSelectedFamilyState(cardId), selected);
        setActionBarOpenState(selected || activeCardIds.length > 0);

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
}
