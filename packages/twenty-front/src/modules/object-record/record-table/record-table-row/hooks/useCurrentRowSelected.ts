import { useContext } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { RowIdContext } from '../../contexts/RowIdContext';
import { isRowSelectedScopedFamilyState } from '../states/isRowSelectedScopedFamilyState';

export const useCurrentRowSelected = () => {
  const currentRowId = useContext(RowIdContext);

  const [isRowSelected] = useRecoilState(
    isRowSelectedScopedFamilyState(currentRowId ?? ''),
  );

  const setCurrentRowSelected = useRecoilCallback(
    ({ set, snapshot }) =>
      (newSelectedState: boolean) => {
        if (!currentRowId) return;

        const isRowSelected = snapshot
          .getLoadable(isRowSelectedScopedFamilyState(currentRowId))
          .valueOrThrow();

        if (newSelectedState && !isRowSelected) {
          set(isRowSelectedScopedFamilyState(currentRowId), true);
        } else if (!newSelectedState && isRowSelected) {
          set(isRowSelectedScopedFamilyState(currentRowId), false);
        }
      },
    [currentRowId],
  );

  return {
    currentRowSelected: isRowSelected,
    setCurrentRowSelected,
  };
};
