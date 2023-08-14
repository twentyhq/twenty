import { useContext } from 'react';
import { useRecoilCallback, useRecoilState, useSetRecoilState } from 'recoil';

import { actionBarOpenState } from '@/ui/action-bar/states/ActionBarIsOpenState';

import { BoardCardIdContext } from '../contexts/BoardCardIdContext';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useCurrentCardSelected() {
  const currentCardId = useContext(BoardCardIdContext);

  const [isCardSelected] = useRecoilState(
    isCardSelectedFamilyState(currentCardId ?? ''),
  );
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);

  const setCurrentCardSelected = useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        if (!currentCardId) return;

        set(isCardSelectedFamilyState(currentCardId), selected);
        setActionBarOpenState(true);
      },
    [],
  );

  return {
    currentCardSelected: isCardSelected,
    setCurrentCardSelected,
  };
}
