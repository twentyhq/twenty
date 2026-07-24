import { isString } from '@sniptt/guards';
import { useLayoutEffect, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { syncValuePreservingCaret } from '@/host/utils/syncValuePreservingCaret';

export const useCaretPreservingElementRef = (
  composedElementRef: ElementRefCallback,
  value: unknown,
): ElementRefCallback => {
  const latestComposedElementRefRef = useRef(composedElementRef);
  latestComposedElementRefRef.current = composedElementRef;

  const attachedElementRef = useRef<Element | null>(null);

  const [caretPreservingElementRef] = useState(
    () => (element: Element | null) => {
      attachedElementRef.current = element;
      latestComposedElementRefRef.current(element);
    },
  );

  useLayoutEffect(() => {
    const attachedElement = attachedElementRef.current;

    if (!isDefined(attachedElement) || !isString(value)) {
      return;
    }

    syncValuePreservingCaret(
      attachedElement as HTMLInputElement | HTMLTextAreaElement,
      value,
    );
  });

  return caretPreservingElementRef;
};
