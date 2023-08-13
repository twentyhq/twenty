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
    ({ set, snapshot }) =>
      (newSelectedState: boolean) => {
        if (!currentCardId) return;

        const isCardSelected = snapshot
          .getLoadable(isCardSelectedFamilyState(currentCardId))
          .valueOrThrow();

        if (newSelectedState && !isCardSelected) {
          set(isCardSelectedFamilyState(currentCardId), true);
        } else if (!newSelectedState && isCardSelected) {
          set(isCardSelectedFamilyState(currentCardId), false);
        }
      },
    [currentCardId],
  );

  return {
    currentCardSelected: isCardSelected,
    setCurrentCardSelected,
  };
}
