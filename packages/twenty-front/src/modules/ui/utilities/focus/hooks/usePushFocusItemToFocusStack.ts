import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';

export const usePushFocusItemToFocusStack = () => {
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  return useRecoilCallback(
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
        globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
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

        set(focusStackState, (currentFocusStack) => [
          ...currentFocusStack.filter(
            (currentFocusStackItem) =>
              currentFocusStackItem.focusId !== focusId,
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
};
