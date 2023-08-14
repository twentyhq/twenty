import { useContext } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { BoardCardIdContext } from '../states/BoardCardIdContext';
import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useCurrentCardSelected() {
  const currentCardId = useContext(BoardCardIdContext);

  const [isCardSelected] = useRecoilState(
    isCardSelectedFamilyState(currentCardId ?? ''),
  );

  const setCurrentCardSelected = useRecoilCallback(
    ({ set }) =>
      (selected: boolean) => {
        if (!currentCardId) return;

        set(isCardSelectedFamilyState(currentCardId), selected);
      },
    [],
  );

  return {
    currentCardSelected: isCardSelected,
    setCurrentCardSelected,
  };
}
