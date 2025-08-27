import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { selector } from 'recoil';
import { focusStackState } from './focusStackState';

export const currentFocusedItemSelector = selector<FocusStackItem | undefined>({
  key: 'currentFocusedItemSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1);
  },
});
