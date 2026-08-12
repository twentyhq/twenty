import { isNumber } from '@sniptt/guards';

import { FRONT_COMPONENT_MEDIA_CAPTURE_DEFAULT_MAX_DURATION_SECONDS } from '@/front-components/media-capture/constants/FrontComponentMediaCaptureDefaultMaxDurationSeconds';
import { FRONT_COMPONENT_MEDIA_CAPTURE_MAX_DURATION_SECONDS } from '@/front-components/media-capture/constants/FrontComponentMediaCaptureMaxDurationSeconds';

// The module's duration invariant: whatever callers pass (including nothing,
// NaN or Infinity from sandboxed code), the recorder always auto-stops within
// the allowed ceiling.
export const normalizeMediaCaptureMaxDurationSeconds = (
  requestedMaxDurationSeconds?: number,
): number => {
  const maxDurationSeconds =
    isNumber(requestedMaxDurationSeconds) &&
    Number.isFinite(requestedMaxDurationSeconds)
      ? requestedMaxDurationSeconds
      : FRONT_COMPONENT_MEDIA_CAPTURE_DEFAULT_MAX_DURATION_SECONDS;

  return Math.min(
    Math.max(Math.floor(maxDurationSeconds), 1),
    FRONT_COMPONENT_MEDIA_CAPTURE_MAX_DURATION_SECONDS,
  );
};
