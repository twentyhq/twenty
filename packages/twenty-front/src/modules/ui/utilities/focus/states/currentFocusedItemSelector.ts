import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createSelector } from '@/ui/utilities/state/jotai/utils/createSelector';
import { focusStackState } from './focusStackState';

export const currentFocusedItemSelector = createSelector<
  FocusStackItem | undefined
>({
  key: 'currentFocusedItemSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1);
  },
});
