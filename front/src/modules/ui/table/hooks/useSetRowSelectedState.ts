import { useRecoilCallback } from 'recoil';

import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';

export function useSetRowSelectedState() {
  return useRecoilCallback(({ set }) => (rowId: string, selected: boolean) => {
    set(isRowSelectedFamilyState(rowId), selected);
  });
}
