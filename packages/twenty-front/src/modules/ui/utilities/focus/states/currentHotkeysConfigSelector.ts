import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { GlobalHotkeysConfig } from '@/ui/utilities/focus/types/HotkeysConfig';
import { selector } from 'recoil';

export const currentHotkeysConfigSelector = selector<
  GlobalHotkeysConfig | undefined
>({
  key: 'currentHotkeysConfigSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);
    return focusStack.at(-1)?.globalHotkeysConfig;
  },
});
