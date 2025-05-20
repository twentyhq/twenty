import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FocusIdentifier } from '@/ui/utilities/focus/types/FocusIdentifier';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeFamilyState } from '@/ui/utilities/hotkey/states/internal/previousHotkeyScopeFamilyState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';

export const useFocusStack = (memoizeKey = 'global') => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope(memoizeKey);

  const pushFocusIdentifier = useRecoilCallback(
    ({ set }) =>
      (
        focusId: string,
        component: {
          type: FocusComponentType;
          instanceId: string;
        },
        // TODO: Remove this once we've migrated hotkey scopes to the new api
        hotkeyScope: HotkeyScope,
      ) => {
        const focusIdentifier: FocusIdentifier = {
          focusId,
          componentType: component.type,
          componentInstanceId: component.instanceId,
        };

        set(focusStackState, (previousFocusStack) => [
          ...previousFocusStack.filter(
            (existingIdentifier) => existingIdentifier.focusId !== focusId,
          ),
          focusIdentifier,
        ]);

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        setHotkeyScopeAndMemorizePreviousScope(
          hotkeyScope.scope,
          hotkeyScope.customScopes,
        );
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  const removeFocusId = useRecoilCallback(
    ({ set }) =>
      (focusId: string) => {
        set(focusStackState, (previousFocusStack) =>
          previousFocusStack.filter(
            (focusIdentifier) => focusIdentifier.focusId !== focusId,
          ),
        );

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        goBackToPreviousHotkeyScope();
      },
    [goBackToPreviousHotkeyScope],
  );

  const resetFocusStack = useRecoilCallback(
    ({ reset }) =>
      () => {
        reset(focusStackState);

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        reset(previousHotkeyScopeFamilyState(memoizeKey));
        reset(currentHotkeyScopeState);
      },
    [memoizeKey],
  );

  const resetFocusStackToFocusIdentifier = useRecoilCallback(
    ({ set }) =>
      (focusIdentifier: FocusIdentifier, hotkeyScope: HotkeyScope) => {
        set(focusStackState, [focusIdentifier]);

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        set(previousHotkeyScopeFamilyState(memoizeKey), null);
        set(currentHotkeyScopeState, hotkeyScope);
      },
    [memoizeKey],
  );

  return {
    pushFocusIdentifier,
    removeFocusId,
    resetFocusStack,
    resetFocusStackToFocusIdentifier,
  };
};
