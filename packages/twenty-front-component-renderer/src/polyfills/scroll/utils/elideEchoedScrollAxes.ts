import { isDefined } from 'twenty-shared/utils';

import { SCROLL_AXES } from '@/constants/ScrollAxes';
import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';

export const elideEchoedScrollAxes = ({
  requestedOffsets,
  lastReadOffsets,
  readCurrentOffset,
}: {
  requestedOffsets: ScrollAxisOffsets;
  lastReadOffsets: ScrollAxisOffsets | undefined;
  readCurrentOffset: (axis: ScrollAxis) => number | undefined;
}): ScrollAxisOffsets => {
  const remainingOffsets: ScrollAxisOffsets = {};

  for (const axis of SCROLL_AXES) {
    const requestedOffset = requestedOffsets[axis];

    if (!isDefined(requestedOffset)) {
      continue;
    }

    const isEchoOfLastRead =
      requestedOffset === lastReadOffsets?.[axis] &&
      requestedOffset === readCurrentOffset(axis);

    if (!isEchoOfLastRead) {
      remainingOffsets[axis] = requestedOffset;
    }
  }

  return remainingOffsets;
};
