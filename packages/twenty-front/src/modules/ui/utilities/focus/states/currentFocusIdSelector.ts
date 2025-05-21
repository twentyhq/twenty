import { selector } from 'recoil';
import { focusStackState } from './focusStackState';

export const currentFocusIdSelector = selector<string | undefined>({
  key: 'currentFocusIdSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);

    return focusStack.at(-1)?.focusId;
  },
});
