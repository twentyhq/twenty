import { createAtomSelector } from '@/ui/utilities/state/jotai/utils/createAtomSelector';
import { focusStackState } from './focusStackState';

export const currentFocusIdSelector = createAtomSelector<string | undefined>({
  key: 'currentFocusIdSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1)?.focusId;
  },
});
