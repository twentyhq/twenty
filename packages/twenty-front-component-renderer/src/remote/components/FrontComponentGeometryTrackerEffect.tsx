import { useEffect } from 'react';

import { type GeometryTracker } from '@/host/types/GeometryTracker';
import { GEOMETRY_TRANSPORT_FAILURE_WARNING } from '@/polyfills/geometry/constants/GeometryTransportFailureWarning';
import { type FrontComponentThread } from '@/types/FrontComponentThread';

let hasWarnedAboutGeometryPushFailure = false;

const warnAboutGeometryPushFailure = (): void => {
  if (hasWarnedAboutGeometryPushFailure) {
    return;
  }

  hasWarnedAboutGeometryPushFailure = true;
  console.warn(GEOMETRY_TRANSPORT_FAILURE_WARNING);
};

type FrontComponentGeometryTrackerEffectProps = {
  thread: FrontComponentThread;
  geometryTracker: GeometryTracker;
};

export const FrontComponentGeometryTrackerEffect = ({
  thread,
  geometryTracker,
}: FrontComponentGeometryTrackerEffectProps) => {
  useEffect(() => {
    geometryTracker.setPushGeometryUpdates((batch) => {
      thread.imports
        .pushGeometryUpdates(batch)
        .catch(warnAboutGeometryPushFailure);
    });

    return () => {
      geometryTracker.reset();
    };
  }, [thread, geometryTracker]);

  return null;
};
