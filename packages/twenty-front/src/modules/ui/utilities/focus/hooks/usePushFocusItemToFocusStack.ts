import { DEBUG_FOCUS_STACK } from '@/ui/utilities/focus/constants/DebugFocusStack';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { type FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
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
  const pushFocusItemToFocusStack = useRecoilCallback(
    ({ snapshot, set }) =>
      ({
        focusId,
        component,
        globalHotkeysConfig,
      }: {
        focusId: string;
        component: {
          type: FocusComponentType;
          instanceId: string;
        };
        globalHotkeysConfig?: Partial<GlobalHotkeysConfig>;
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
      },
    [],
  );

  return { pushFocusItemToFocusStack };
};
