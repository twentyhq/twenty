import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusGlobalHotkeysConfig } from '@/ui/utilities/focus/types/FocusGlobalHotkeysConfig';
import { selector } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const currentGlobalHotkeysConfigSelector =
  selector<FocusGlobalHotkeysConfig>({
    key: 'currentGlobalHotkeysConfigSelector',
    get: ({ get }) => {
      const focusStack = get(focusStackState);
      const lastFocusStackItem = focusStack.at(-1);

      if (!isDefined(lastFocusStackItem)) {
        return {
          enableGlobalHotkeysWithModifiers: true,
          enableGlobalHotkeysConflictingWithKeyboard: true,
        };
      }

      return lastFocusStackItem.globalHotkeysConfig;
    },
  });
