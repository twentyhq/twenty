import { useContext, useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { FrontComponentGeometryTrackerContext } from '@/host/contexts/FrontComponentGeometryTrackerContext';
import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { type GeometryTracker } from '@/host/types/GeometryTracker';

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

  // Keyed on the tracker and remote id so React detaches the previous ref
  // (unregistering the old mapping) and attaches a fresh one whenever either
  // changes, instead of staying bound to the first render's values.
  return useMemo(
    () =>
      isDefined(geometryTracker) && isDefined(remoteElementId)
        ? createGeometryNodeRef(geometryTracker, remoteElementId)
        : undefined,
    [geometryTracker, remoteElementId],
  );
};
