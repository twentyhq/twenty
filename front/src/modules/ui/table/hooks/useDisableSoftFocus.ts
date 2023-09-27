import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveState } from '../states/isSoftFocusActiveState';
import { isSoftFocusOnTableCellFamilyState } from '../states/isSoftFocusOnTableCellFamilyState';
import { softFocusPositionState } from '../states/softFocusPositionState';

export const useDisableSoftFocus = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return () => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionState)
        .valueOrThrow();

      set(isSoftFocusActiveState, false);

      set(isSoftFocusOnTableCellFamilyState(currentPosition), false);
    };
  }, []);
