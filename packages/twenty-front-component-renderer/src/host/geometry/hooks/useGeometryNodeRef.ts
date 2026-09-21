import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentGeometryTrackerContext } from '@/host/geometry/contexts/FrontComponentGeometryTrackerContext';
import { type ElementRefCallback } from '@/host/elements/types/ElementRefCallback';
import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';

const createGeometryNodeRef = (
  geometryTracker: GeometryTracker,
  remoteElementId: string,
): ElementRefCallback => {
  let registeredElement: Element | null = null;

  return (element: Element | null) => {
    if (isDefined(registeredElement)) {
      geometryTracker.unregisterNode(remoteElementId, registeredElement);
    }

    registeredElement = element;

    if (isDefined(element)) {
      geometryTracker.registerNode(remoteElementId, element);
    }
  };
};

export const useGeometryNodeRef = (
  remoteElementId: string | undefined,
): ElementRefCallback | undefined => {
  const geometryTracker = useContext(FrontComponentGeometryTrackerContext);

  return useMemo(
    () =>
      isDefined(geometryTracker) && isDefined(remoteElementId)
        ? createGeometryNodeRef(geometryTracker, remoteElementId)
        : undefined,
    [geometryTracker, remoteElementId],
  );
};
