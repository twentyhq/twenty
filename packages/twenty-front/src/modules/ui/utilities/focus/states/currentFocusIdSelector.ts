import { createSelectorV2 } from '@/ui/utilities/state/jotai/utils/createSelectorV2';
import { focusStackState } from './focusStackState';

export const currentFocusIdSelector = createSelectorV2<string | undefined>({
  key: 'currentFocusIdSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1)?.focusId;
  },
});
