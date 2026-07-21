import { useRef, useState } from 'react';

import { type ReactUnsupportedEventHandlers } from '@/host/types/ReactUnsupportedEventHandlers';
import { createReactUnsupportedEventListenerRef } from '@/host/utils/createReactUnsupportedEventListenerRef';

export const useReactUnsupportedEventListenerRef = (
  reactUnsupportedEventHandlers: ReactUnsupportedEventHandlers,
): ((element: Element | null) => void) | undefined => {
  const latestHandlersRef = useRef(reactUnsupportedEventHandlers);
  latestHandlersRef.current = reactUnsupportedEventHandlers;

  const [reactUnsupportedEventListenerRef] = useState(() =>
    createReactUnsupportedEventListenerRef(latestHandlersRef),
  );

  const hasReactUnsupportedEventHandlers =
    Object.keys(reactUnsupportedEventHandlers).length > 0;

  return hasReactUnsupportedEventHandlers
    ? reactUnsupportedEventListenerRef
    : undefined;
};
