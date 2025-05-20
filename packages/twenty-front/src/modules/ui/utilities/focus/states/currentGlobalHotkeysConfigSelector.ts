import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusGlobalHotkeysConfig } from '@/ui/utilities/focus/types/FocusGlobalHotkeysConfig';
import { selector } from 'recoil';

export const currentGlobalHotkeysConfigSelector = selector<
  FocusGlobalHotkeysConfig | undefined
>({
  key: 'currentGlobalHotkeysConfigSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);
    return focusStack.at(-1)?.globalHotkeysConfig;
  },
});
