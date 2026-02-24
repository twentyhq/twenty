import { createSelector } from '@/ui/utilities/state/jotai/utils/createSelector';
import { focusStackState } from './focusStackState';

export const currentFocusIdSelector = createSelector<string | undefined>({
  key: 'currentFocusIdSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1)?.focusId;
  },
});
