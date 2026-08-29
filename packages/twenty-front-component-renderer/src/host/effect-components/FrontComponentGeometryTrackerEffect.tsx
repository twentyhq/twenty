import { useEffect } from 'react';

import { type GeometryTracker } from '@/host/geometry/types/GeometryTracker';
import { GEOMETRY_TRANSPORT_FAILURE_WARNING } from '@/polyfills/geometry/constants/GeometryTransportFailureWarning';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

type FrontComponentGeometryTrackerEffectProps = {
  thread: FrontComponentThread;
  geometryTracker: GeometryTracker;
};

export const FrontComponentGeometryTrackerEffect = ({
  thread,
  geometryTracker,
}: FrontComponentGeometryTrackerEffectProps) => {
  useEffect(() => {
    let hasWarnedAboutGeometryPushFailure = false;

    geometryTracker.setPushGeometryUpdates((batch) => {
      thread.imports.pushGeometryUpdates(batch).catch(() => {
        if (hasWarnedAboutGeometryPushFailure) {
          return;
        }

        hasWarnedAboutGeometryPushFailure = true;
        console.warn(GEOMETRY_TRANSPORT_FAILURE_WARNING);
      });
    });

    return () => {
      geometryTracker.reset();
    };
  }, [thread, geometryTracker]);

  return null;
};
