import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';

export const useComposedElementRef = (
  elementRefs: (ElementRefCallback | undefined)[],
): ElementRefCallback | undefined => {
  const latestElementRefsRef = useRef(elementRefs);
  latestElementRefsRef.current = elementRefs;

  const [composedElementRef] = useState(() => (element: Element | null) => {
    for (const elementRef of latestElementRefsRef.current) {
      elementRef?.(element);
    }
  });

  return elementRefs.some(isDefined) ? composedElementRef : undefined;
};
