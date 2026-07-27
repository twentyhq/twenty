import { useRef, useState } from 'react';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { type ReactUnsupportedEventHandlers } from '@/host/types/ReactUnsupportedEventHandlers';
import { createReactUnsupportedEventListenerRef } from '@/host/utils/createReactUnsupportedEventListenerRef';

export const useReactUnsupportedEventListenerRef = (
  reactUnsupportedEventHandlers: ReactUnsupportedEventHandlers,
): ElementRefCallback => {
  const latestHandlersRef = useRef(reactUnsupportedEventHandlers);
  latestHandlersRef.current = reactUnsupportedEventHandlers;

  const [reactUnsupportedEventListenerRef] = useState(() =>
    createReactUnsupportedEventListenerRef(latestHandlersRef),
  );

  return reactUnsupportedEventListenerRef;
};
