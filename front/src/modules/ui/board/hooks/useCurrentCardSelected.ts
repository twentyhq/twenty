import { useContext } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { actionBarOpenState } from '@/ui/action-bar/states/actionBarIsOpenState';

import { BoardCardIdContext } from '../contexts/BoardCardIdContext';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useCurrentCardSelected() {
  const currentCardId = useContext(BoardCardIdContext);

  const isCardSelected = useRecoilValue(
    isCardSelectedFamilyState(currentCardId ?? ''),
  );

  const setCurrentCardSelected = useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        if (!currentCardId) return;

        set(isCardSelectedFamilyState(currentCardId), selected);
        set(actionBarOpenState, true);
      },
    [currentCardId],
  );

  return {
    currentCardSelected: isCardSelected,
    setCurrentCardSelected,
  };
}
