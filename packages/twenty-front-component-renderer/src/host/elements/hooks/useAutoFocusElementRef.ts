import { useEffect, useRef } from 'react';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

export const useAutoFocusElementRef = (
  shouldAutoFocus: boolean,
): ElementRefCallback => {
  const elementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (shouldAutoFocus && elementRef.current instanceof HTMLElement) {
      elementRef.current.focus();
    }
  }, [shouldAutoFocus]);

  return (element) => {
    elementRef.current = element;
  };
};
