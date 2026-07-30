import { useEffect, useRef, useState } from 'react';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

// Remote code has no layout information, so it cannot compute scroll offsets.
// Instead it stamps a token on the element it wants visible; every token
// change scrolls the element into its nearest scroll container host-side.
export const useScrollIntoViewRef = (
  scrollIntoViewToken: unknown,
): ElementRefCallback => {
  const elementRef = useRef<Element | null>(null);

  const [refCallback] = useState(() => (element: Element | null) => {
    elementRef.current = element;
  });

  useEffect(() => {
    if (!isNonEmptyString(scrollIntoViewToken)) {
      return;
    }

    elementRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  }, [scrollIntoViewToken]);

  return refCallback;
};
