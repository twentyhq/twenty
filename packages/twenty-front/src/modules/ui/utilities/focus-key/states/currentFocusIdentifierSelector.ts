import { FocusIdentifier } from '@/ui/utilities/focus-key/types/FocusIdentifier';
import { selector } from 'recoil';
import { focusStackState } from './focusStackState';

export const currentFocusIdentifierSelector = selector<
  FocusIdentifier | undefined
>({
  key: 'currentFocusIdentifierSelector',
  get: ({ get }) => {
    const stack = get(focusStackState);
    return stack.length > 0 ? stack[stack.length - 1] : undefined;
  },
});
