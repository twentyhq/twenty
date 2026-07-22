import { useRef, useState } from 'react';

import { type ReactUnsupportedEventHandlers } from '@/host/types/ReactUnsupportedEventHandlers';
import { createReactUnsupportedEventListenerRef } from '@/host/utils/createReactUnsupportedEventListenerRef';

export const useReactUnsupportedEventListenerRef = (
  reactUnsupportedEventHandlers: ReactUnsupportedEventHandlers,
): ((element: Element | null) => void) => {
  const latestHandlersRef = useRef(reactUnsupportedEventHandlers);
  latestHandlersRef.current = reactUnsupportedEventHandlers;

  const [reactUnsupportedEventListenerRef] = useState(() =>
    createReactUnsupportedEventListenerRef(latestHandlersRef),
  );

  return reactUnsupportedEventListenerRef;
};
