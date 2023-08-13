import { useRecoilCallback } from 'recoil';

import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useSetCardSelected() {
  return useRecoilCallback(({ set }) => (cardId: string, selected: boolean) => {
    set(isCardSelectedFamilyState(cardId), selected);
  });
}
