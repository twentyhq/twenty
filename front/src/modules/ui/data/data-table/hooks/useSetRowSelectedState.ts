import { useRecoilCallback } from 'recoil';

import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';

export const useSetRowSelectedState = () =>
  useRecoilCallback(({ set }) => (rowId: string, selected: boolean) => {
    set(isRowSelectedFamilyState(rowId), selected);
  });
