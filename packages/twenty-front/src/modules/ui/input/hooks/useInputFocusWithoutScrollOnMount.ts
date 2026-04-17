import { useEffect, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { SELECTABLE_LIST_BLURRED_ATTRIBUTE } from '@/ui/layout/selectable-list/constants/SelectableListBlurredAttribute';

export const useInputFocusWithoutScrollOnMount = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (
      isDefined(inputRef.current) &&
      inputRef.current.dataset[SELECTABLE_LIST_BLURRED_ATTRIBUTE] !== 'true'
    ) {
      inputRef.current.focus({ preventScroll: true });
    }
  });

  return { inputRef };
};
