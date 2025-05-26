import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeFamilyState } from '@/ui/utilities/hotkey/states/internal/previousHotkeyScopeFamilyState';
import { useRecoilCallback } from 'recoil';

export const useResetFocusStack = () => {
  return useRecoilCallback(
    ({ reset }) =>
      (memoizeKey = 'global') => {
        reset(focusStackState);

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        reset(previousHotkeyScopeFamilyState(memoizeKey as string));
        reset(currentHotkeyScopeState);
      },
    [],
  );
};
