import { useRecoilCallback } from 'recoil';

import { isSoftFocusActiveScopedState } from '../../states/isSoftFocusActiveScopedState';
import { isSoftFocusOnTableCellScopedFamilyState } from '../../states/isSoftFocusOnTableCellScopedFamilyState';
import { softFocusPositionScopedState } from '../../states/softFocusPositionScopedState';

export const useDisableSoftFocus = () =>
  useRecoilCallback(({ set, snapshot }) => {
    return () => {
      const currentPosition = snapshot
        .getLoadable(softFocusPositionScopedState)
        .valueOrThrow();

      set(isSoftFocusActiveScopedState, false);

      set(isSoftFocusOnTableCellScopedFamilyState(currentPosition), false);
    };
  }, []);
