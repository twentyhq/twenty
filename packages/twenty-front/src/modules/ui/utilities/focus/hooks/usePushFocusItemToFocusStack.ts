import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';
import { useRecoilCallback } from 'recoil';
import { logDebug } from '~/utils/logDebug';

const addOrMoveItemToTheTopOfTheStack = ({
  focusStackItem,
  currentFocusStack,
}: {
  focusStackItem: FocusStackItem;
  currentFocusStack: FocusStackItem[];
}) => [
  ...currentFocusStack.filter(
    (currentFocusStackItem) =>
      currentFocusStackItem.focusId !== focusStackItem.focusId,
  ),
  focusStackItem,
];

export const usePushFocusItemToFocusStack = () => {
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const pushFocusItemToFocusStack = useRecoilCallback(
    ({ snapshot, set }) =>
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
        memoizeKey?: string;
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
          // TODO: Remove this once we've migrated hotkey scopes to the new api
          memoizeKey,
        };

        const currentFocusStack = snapshot
          .getLoadable(focusStackState)
          .getValue();

        const newFocusStack = addOrMoveItemToTheTopOfTheStack({
          focusStackItem,
          currentFocusStack,
        });

        set(focusStackState, newFocusStack);

        if (DEBUG_FOCUS_STACK) {
          logDebug(`DEBUG: pushFocusItemToFocusStack ${focusId}`, {
            focusStackItem,
            newFocusStack,
          });
        }

        // TODO: Remove this once we've migrated hotkey scopes to the new api
        setHotkeyScopeAndMemorizePreviousScope({
          scope: hotkeyScope.scope,
          customScopes: hotkeyScope.customScopes,
          memoizeKey,
        });
      },
    [setHotkeyScopeAndMemorizePreviousScope],
  );

  return { pushFocusItemToFocusStack };
};
