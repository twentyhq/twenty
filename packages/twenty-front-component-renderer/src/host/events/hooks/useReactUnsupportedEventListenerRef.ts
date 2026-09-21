import { useRef, useState } from 'react';

import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { type ReactUnsupportedEventHandlers } from '@/host/events/types/ReactUnsupportedEventHandlers';
import { createReactUnsupportedEventListenerRef } from '@/host/events/utils/createReactUnsupportedEventListenerRef';

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
