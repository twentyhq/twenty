import { isDefined } from 'twenty-shared/utils';

import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollAxisOffsets } from '@/types/ScrollAxisOffsets';

const SCROLL_AXES: ScrollAxis[] = ['top', 'left'];

export const elideEchoedScrollAxes = ({
  requestedOffsets,
  lastReadOffsets,
  currentOffsets,
}: {
  requestedOffsets: ScrollAxisOffsets;
  lastReadOffsets: ScrollAxisOffsets | undefined;
  currentOffsets: ScrollAxisOffsets;
}): ScrollAxisOffsets => {
  const remainingOffsets: ScrollAxisOffsets = {};

  for (const axis of SCROLL_AXES) {
    const requestedOffset = requestedOffsets[axis];

    if (!isDefined(requestedOffset)) {
      continue;
    }

    const isEchoOfLastRead =
      requestedOffset === lastReadOffsets?.[axis] &&
      requestedOffset === currentOffsets[axis];

    if (!isEchoOfLastRead) {
      remainingOffsets[axis] = requestedOffset;
    }
  }

  return remainingOffsets;
};
