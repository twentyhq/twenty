import { useContext, useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentGeometryTrackerContext } from '@/host/contexts/FrontComponentGeometryTrackerContext';
import { type ElementRefCallback } from '@/host/types/ElementRefCallback';

export const useGeometryNodeRef = (
  remoteElementId: string | undefined,
): ElementRefCallback | undefined => {
  const geometryTracker = useContext(FrontComponentGeometryTrackerContext);

  const latestGeometryTrackerRef = useRef(geometryTracker);
  latestGeometryTrackerRef.current = geometryTracker;

  const latestRemoteElementIdRef = useRef(remoteElementId);
  latestRemoteElementIdRef.current = remoteElementId;

  const [geometryNodeRef] = useState(() => {
    let registeredElement: Element | null = null;
    let registeredRemoteElementId: string | null = null;

    return (element: Element | null) => {
      const tracker = latestGeometryTrackerRef.current;

      if (
        isDefined(registeredElement) &&
        isDefined(registeredRemoteElementId)
      ) {
        tracker?.unregisterNode(registeredRemoteElementId, registeredElement);
      }

      registeredElement = element;
      registeredRemoteElementId = latestRemoteElementIdRef.current ?? null;

      if (isDefined(element) && isDefined(registeredRemoteElementId)) {
        tracker?.registerNode(registeredRemoteElementId, element);
      }
    };
  });

  return isDefined(geometryTracker) && isDefined(remoteElementId)
    ? geometryNodeRef
    : undefined;
};
