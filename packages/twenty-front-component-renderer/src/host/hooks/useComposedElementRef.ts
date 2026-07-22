import { useRef, useState } from 'react';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';

export const useComposedElementRef = (
  elementRefs: (ElementRefCallback | undefined)[],
): ElementRefCallback => {
  const latestElementRefsRef = useRef(elementRefs);
  latestElementRefsRef.current = elementRefs;

  const [composedElementRef] = useState(() => (element: Element | null) => {
    for (const elementRef of latestElementRefsRef.current) {
      elementRef?.(element);
    }
  });

  return composedElementRef;
};
