import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSoftFocusOnCellFamilyState } from '../states/isSoftFocusOnCellFamilyState';
import { softFocusPositionState } from '../states/softFocusPositionState';

export const useDisableSoftFocus = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return () => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionState)
        .valueOrThrow();

      set(isSoftFocusActiveState, false);

      set(isSoftFocusOnCellFamilyState(currentPosition), false);
    };
  }, []);
