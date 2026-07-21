import { isNonEmptyString } from '@sniptt/guards';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { syncValuePreservingCaret } from '@/host/utils/syncValuePreservingCaret';

export const useCaretPreservingElementRef = (
  composedElementRef: ElementRefCallback | undefined,
  value: unknown,
): ElementRefCallback => {
  const latestComposedElementRefRef = useRef(composedElementRef);
  latestComposedElementRefRef.current = composedElementRef;

  const latestValueRef = useRef(value);
  latestValueRef.current = value;

  const [caretPreservingElementRef] = useState(
    () => (element: Element | null) => {
      latestComposedElementRefRef.current?.(element);

      if (!isDefined(element) || !isNonEmptyString(latestValueRef.current)) {
        return;
      }

      syncValuePreservingCaret(
        element as HTMLInputElement | HTMLTextAreaElement,
        latestValueRef.current,
      );
    },
  );

  return caretPreservingElementRef;
};
