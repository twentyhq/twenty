import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FocusIdentifier } from '@/ui/utilities/focus/types/FocusIdentifier';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeFamilyState } from '@/ui/utilities/hotkey/states/internal/previousHotkeyScopeFamilyState';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';

export const useFocusStack = () => {
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const pushFocusIdentifier = useRecoilCallback(
    ({ set }) =>
      ({
        focusId,
        component,
        hotkeyScope,
        memoizeKey = 'global',
      }: {
        focusId: string;
        component: {
          type: FocusComponentType;
          instanceId: string;
        };
        // TODO: Remove this once we've migrated hotkey scopes to the new api
        hotkeyScope: HotkeyScope;
        memoizeKey: string;
      }) => {
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
        setHotkeyScopeAndMemorizePreviousScope({
          scope: hotkeyScope.scope,
          customScopes: hotkeyScope.customScopes,
          memoizeKey,
        });
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  const removeFocusId = useRecoilCallback(
    ({ set }) =>
      ({ focusId, memoizeKey }: { focusId: string; memoizeKey: string }) => {
        set(focusStackState, (previousFocusStack) =>
          previousFocusStack.filter(
            (focusIdentifier) => focusIdentifier.focusId !== focusId,
          ),
        );

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        goBackToPreviousHotkeyScope(memoizeKey);
      },
    [goBackToPreviousHotkeyScope],
  );

  const resetFocusStack = useRecoilCallback(
    ({ reset }) =>
      (memoizeKey = 'global') => {
        reset(focusStackState);

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        reset(previousHotkeyScopeFamilyState(memoizeKey as string));
        reset(currentHotkeyScopeState);
      },
    [],
  );

  const resetFocusStackToFocusIdentifier = useRecoilCallback(
    ({ set }) =>
      ({
        focusIdentifier,
        hotkeyScope,
        memoizeKey,
      }: {
        focusIdentifier: FocusIdentifier;
        hotkeyScope: HotkeyScope;
        memoizeKey: string;
      }) => {
        set(focusStackState, [focusIdentifier]);

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        set(previousHotkeyScopeFamilyState(memoizeKey), null);
        set(currentHotkeyScopeState, hotkeyScope);
      },
    [],
  );

  return {
    pushFocusIdentifier,
    removeFocusId,
    resetFocusStack,
    resetFocusStackToFocusIdentifier,
  };
};
