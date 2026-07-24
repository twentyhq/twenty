import { useEffect } from 'react';

import { type GeometryTracker } from '@/host/types/GeometryTracker';
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
    geometryTracker.setPushGeometryUpdates((batch) => {
      thread.imports.pushGeometryUpdates(batch).catch(() => {});
    });

    return () => {
      geometryTracker.reset();
    };
  }, [thread, geometryTracker]);

  return null;
};
