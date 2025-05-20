import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { currentHotkeyScopeState } from '@/ui/utilities/hotkey/states/internal/currentHotkeyScopeState';
import { previousHotkeyScopeFamilyState } from '@/ui/utilities/hotkey/states/internal/previousHotkeyScopeFamilyState';
import { CustomHotkeyScopes } from '@/ui/utilities/hotkey/types/CustomHotkeyScope';
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
        customScopes,
      }: {
        focusId: string;
        component: {
          type: FocusComponentType;
          instanceId: string;
        };
        customScopes?: CustomHotkeyScopes;
        // TODO: Remove this once we've migrated hotkey scopes to the new api
        hotkeyScope: HotkeyScope;
        memoizeKey: string;
      }) => {
        const computedCustomScopes = {
          commandMenu: customScopes?.commandMenu ?? true,
          commandMenuOpen: customScopes?.commandMenuOpen ?? true,
          goto: customScopes?.goto ?? false,
          keyboardShortcutMenu: customScopes?.keyboardShortcutMenu ?? false,
        };

        const focusStackItem: FocusStackItem = {
          focusIdentifier: {
            focusId,
            componentType: component.type,
            componentInstanceId: component.instanceId,
          },
          customScopes: computedCustomScopes,
        };

        set(focusStackState, (previousFocusStack) => [
          ...previousFocusStack.filter(
            (existingFocusStackItem) =>
              existingFocusStackItem.focusIdentifier.focusId !== focusId,
          ),
          focusStackItem,
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
            (focusStackItem) =>
              focusStackItem.focusIdentifier.focusId !== focusId,
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
        focusStackItem,
        hotkeyScope,
        memoizeKey,
      }: {
        focusStackItem: FocusStackItem;
        hotkeyScope: HotkeyScope;
        memoizeKey: string;
      }) => {
        set(focusStackState, [focusStackItem]);

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
