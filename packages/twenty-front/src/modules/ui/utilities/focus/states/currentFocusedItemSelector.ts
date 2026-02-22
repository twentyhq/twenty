import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';
import { focusStackState } from './focusStackState';

export const currentFocusedItemSelector = createSelectorV2<
  FocusStackItem | undefined
>({
  key: 'currentFocusedItemSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1);
  },
});
