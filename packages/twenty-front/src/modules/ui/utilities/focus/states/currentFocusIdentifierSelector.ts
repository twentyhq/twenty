import { FocusIdentifier } from '@/ui/utilities/focus/types/FocusIdentifier';
import { selector } from 'recoil';
import { focusStackState } from './focusStackState';

export const currentFocusIdentifierSelector = selector<
  FocusIdentifier | undefined
>({
  key: 'currentFocusIdentifierSelector',
  get: ({ get }) => {
    const focusStack = get(focusStackState);
    return focusStack.length > 0 ? focusStack.at(-1) : undefined;
  },
});
