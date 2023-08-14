import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { actionBarOpenState } from '@/ui/action-bar/states/actionBarIsOpenState';

import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useSetCardSelected() {
  const setActionBarOpenState = useSetRecoilState(actionBarOpenState);

  return useRecoilCallback(({ set }) => (cardId: string, selected: boolean) => {
    set(isCardSelectedFamilyState(cardId), selected);
    setActionBarOpenState(true);
  });
}
