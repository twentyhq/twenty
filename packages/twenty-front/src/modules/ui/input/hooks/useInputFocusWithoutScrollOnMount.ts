import { useStore } from 'jotai';
import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { isSelectableListGridFocusedState } from '@/ui/layout/selectable-list/states/isSelectableListGridFocusedState';

export const useInputFocusWithoutScrollOnMount = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const store = useStore();

  useEffect(() => {
    if (
      isDefined(inputRef.current) &&
      !store.get(isSelectableListGridFocusedState.atom)
    ) {
      inputRef.current.focus({ preventScroll: true });
    }
  });

  return { inputRef };
};
