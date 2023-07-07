import { useRecoilCallback } from 'recoil';

import { isSoftFocusOnCellFamilyState } from '../states/isSoftFocusOnCellFamilyState';
import { softFocusPositionState } from '../states/softFocusPositionState';

export function useDisableSoftFocus() {
  return useRecoilCallback(({ set, snapshot }) => {
    return () => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionState)
        .valueOrThrow();

      set(isSoftFocusOnCellFamilyState(currentPosition), false);
    };
  }, []);
}
