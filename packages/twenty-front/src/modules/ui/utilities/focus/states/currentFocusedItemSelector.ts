import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { focusStackState } from './focusStackState';

export const currentFocusedItemSelector = createAtomSelector<
  FocusStackItem | undefined
>({
  key: 'currentFocusedItemSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1);
  },
});
