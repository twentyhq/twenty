import { useEffect, useRef } from 'react';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';

// React only honors autoFocus while mounting, but the remote autofocus
// attribute can reach the host after its element mounted, so the focus call
// re-runs whenever the flag appears.
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
