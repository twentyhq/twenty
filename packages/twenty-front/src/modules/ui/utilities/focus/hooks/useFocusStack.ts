import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FocusGlobalHotkeysConfig } from '@/ui/utilities/focus/types/FocusGlobalHotkeysConfig';
import { FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
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
        globalHotkeysConfig,
      }: {
        focusId: string;
        component: {
          type: FocusComponentType;
          instanceId: string;
        };
        globalHotkeysConfig?: Partial<FocusGlobalHotkeysConfig>;
        // TODO: Remove this once we've migrated hotkey scopes to the new api
        hotkeyScope: HotkeyScope;
        memoizeKey: string;
      }) => {
        const focusStackItem: FocusStackItem = {
          focusId,
          componentInstance: {
            componentType: component.type,
            componentInstanceId: component.instanceId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysWithModifiers:
              globalHotkeysConfig?.enableGlobalHotkeysWithModifiers ?? true,
            enableGlobalHotkeysConflictingWithKeyboard:
              globalHotkeysConfig?.enableGlobalHotkeysConflictingWithKeyboard ??
              true,
          },
        };

        set(focusStackState, (previousFocusStack) => [
          ...previousFocusStack.filter(
            (existingFocusStackItem) =>
              existingFocusStackItem.focusId !== focusId,
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
            (focusStackItem) => focusStackItem.focusId !== focusId,
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
