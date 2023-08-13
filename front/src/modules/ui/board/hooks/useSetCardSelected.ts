import { useRecoilCallback } from 'recoil';

import { isCardSelectedFamilyState } from '../states/isCardSelectedFamilyState';

export function useSetCardSelected() {
  return useRecoilCallback(({ set }) => (rowId: string, selected: boolean) => {
    set(isCardSelectedFamilyState(rowId), selected);
  });
}
