import { useRef, useState } from 'react';

import { type HostNativeEventHandlers } from '@/host/types/HostNativeEventHandlers';
import { createHostNativeEventListenerRef } from '@/host/utils/createHostNativeEventListenerRef';

export const useHostNativeEventListenerRef = (
  nativeEventHandlers: HostNativeEventHandlers,
): ((element: Element | null) => void) | undefined => {
  const latestHandlersRef = useRef(nativeEventHandlers);
  latestHandlersRef.current = nativeEventHandlers;

  const [hostNativeEventListenerRef] = useState(() =>
    createHostNativeEventListenerRef(latestHandlersRef),
  );

  const hasNativeEventHandlers = Object.keys(nativeEventHandlers).length > 0;

  return hasNativeEventHandlers ? hostNativeEventListenerRef : undefined;
};
