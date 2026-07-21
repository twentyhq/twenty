import { useRef, useState } from 'react';

import { type ElementRefCallback } from '@/host/types/ElementRefCallback';
import { type GeometryTracker } from '@/host/types/GeometryTracker';

export const useGeometryRootRef = (
  geometryTracker: GeometryTracker,
): ElementRefCallback => {
  const latestGeometryTrackerRef = useRef(geometryTracker);
  latestGeometryTrackerRef.current = geometryTracker;

  const [geometryRootRef] = useState(() => (element: Element | null) => {
    latestGeometryTrackerRef.current.setRoot(element);
  });

  return geometryRootRef;
};
