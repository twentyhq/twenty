import { isDefined } from 'twenty-shared/utils';

import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollCommand } from '@/types/ScrollCommand';

export const resolveOptimisticScrollOffset = ({
  hostOffset,
  pendingCommands,
  axis,
}: {
  hostOffset: number;
  pendingCommands: ScrollCommand[];
  axis: ScrollAxis;
}): number => {
  let scrollOffset = hostOffset;

  for (const { request } of pendingCommands) {
    if (request.method === 'scrollTo' && isDefined(request[axis])) {
      scrollOffset = request[axis];
    }
  }

  return scrollOffset;
};
