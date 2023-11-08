import { useContext } from 'react';
import { useRecoilCallback } from 'recoil';

import { RowIdContext } from '../contexts/RowIdContext';
import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';

export const useCurrentRowSelected = () => {
  const currentRowId = useContext(RowIdContext);

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (newSelectedState: boolean) => {
        if (!currentRowId) return;

        const isRowSelected = snapshot
          .getLoadable(isRowSelectedFamilyState(currentRowId))
          .valueOrThrow();

        if (newSelectedState && !isRowSelected) {
          set(isRowSelectedFamilyState(currentRowId), true);
        } else if (!newSelectedState && isRowSelected) {
          set(isRowSelectedFamilyState(currentRowId), false);
        }
      },
    [currentRowId],
  );

  return {
    currentRowSelected: isRowSelected,
    setCurrentRowSelected,
  };
};
