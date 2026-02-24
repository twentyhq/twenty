import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { DEFAULT_GLOBAL_HOTKEYS_CONFIG } from '@/ui/utilities/hotkey/constants/DefaultGlobalHotkeysConfig';
import { type GlobalHotkeysConfig } from '@/ui/utilities/hotkey/types/GlobalHotkeysConfig';
import { createSelector } from '@/ui/utilities/state/jotai/utils/createSelector';
import { isDefined } from 'twenty-shared/utils';

export const currentGlobalHotkeysConfigSelector =
  createSelector<GlobalHotkeysConfig>({
    key: 'currentGlobalHotkeysConfigSelector',
    get: ({ get }) => {
      const focusStack = get(focusStackState);
      const lastFocusStackItem = focusStack.at(-1);

      if (!isDefined(lastFocusStackItem)) {
        return DEFAULT_GLOBAL_HOTKEYS_CONFIG;
      }

      return lastFocusStackItem.globalHotkeysConfig;
    },
  });
