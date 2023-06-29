import { useRecoilCallback } from 'recoil';

import { isSoftFocusOnCellFamilyState } from '../states/isSoftFocusOnCellFamilyState';
import { softFocusPositionState } from '../states/softFocusPositionState';

export function useSetTableSoftFocusActiveStatus() {
  return useRecoilCallback(({ set, snapshot }) => {
    return (enabled: boolean) => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionState)
        .valueOrThrow();

      set(isSoftFocusOnCellFamilyState(currentPosition), false);
      set(softFocusPositionState, currentPosition);
      set(isSoftFocusOnCellFamilyState(currentPosition), enabled);
    };
  }, []);
}
