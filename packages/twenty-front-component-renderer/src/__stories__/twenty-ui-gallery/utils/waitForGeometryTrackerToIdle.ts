import { waitForAnimationFrames } from '@/__stories__/shared/test-utils/waitForAnimationFrames';
import { GEOMETRY_IDLE_FRAME_THRESHOLD } from '@/host/geometry/constants/GeometryIdleFrameThreshold';

export const waitForGeometryTrackerToIdle = () =>
  waitForAnimationFrames(GEOMETRY_IDLE_FRAME_THRESHOLD * 2);
