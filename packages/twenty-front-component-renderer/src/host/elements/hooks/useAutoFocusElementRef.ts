import { useEffect, useRef } from 'react';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

// Firing once per mounted element keeps a guest from toggling the attribute to
// pull focus out of the host UI over and over.
export const useAutoFocusElementRef = (
  shouldAutoFocus: boolean,
): ElementRefCallback => {
  const elementRef = useRef<Element | null>(null);
  const hasAutoFocusedRef = useRef(false);

  useEffect(() => {
    if (
      !shouldAutoFocus ||
      hasAutoFocusedRef.current ||
      !(elementRef.current instanceof HTMLElement)
    ) {
      return;
    }

    hasAutoFocusedRef.current = true;
    elementRef.current.focus();
  }, [shouldAutoFocus]);

  return (element) => {
    elementRef.current = element;
  };
};
