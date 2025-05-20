import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusGlobalHotkeysConfig } from '@/ui/utilities/focus/types/FocusGlobalHotkeysConfig';
import { selector } from 'recoil';

export const currentHotkeysConfigSelector = selector<
  FocusGlobalHotkeysConfig | undefined
>({
  key: 'currentHotkeysConfigSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);
    return focusStack.at(-1)?.globalHotkeysConfig;
  },
});
