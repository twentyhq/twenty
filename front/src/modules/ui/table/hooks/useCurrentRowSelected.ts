import { useContext } from 'react';
import { useRecoilCallback, useRecoilState } from 'recoil';

import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { RowIdContext } from '../states/RowIdContext';

import { useCurrentRowEntityId } from './useCurrentEntityId';

export function useCurrentRowSelected() {
  const currentRowId = useContext(RowIdContext);

  const [isRowSelected] = useRecoilState(
    isRowSelectedFamilyState(currentRowId ?? ''),
  );

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
}
