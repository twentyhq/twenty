import { useRecoilCallback, useRecoilState } from 'recoil';

import { isRowSelectedFamilyState } from '../states/isRowSelectedFamilyState';
import { numberOfSelectedRowState } from '../states/numberOfSelectedRowState';

import { useCurrentRowEntityId } from './useCurrentEntityId';

export function useCurrentRowSelected() {
  const currentRowId = useCurrentRowEntityId();

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

        const numberOfSelectedRow = snapshot
          .getLoadable(numberOfSelectedRowState)
          .valueOrThrow();

        if (newSelectedState && !isRowSelected) {
          set(numberOfSelectedRowState, numberOfSelectedRow + 1);
          set(isRowSelectedFamilyState(currentRowId), true);
        } else if (!newSelectedState && isRowSelected) {
          set(numberOfSelectedRowState, numberOfSelectedRow - 1);
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
