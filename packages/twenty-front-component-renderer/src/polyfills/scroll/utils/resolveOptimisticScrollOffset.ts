import { readScrollToOffsetOnAxis } from '@/polyfills/scroll/utils/readScrollToOffsetOnAxis';
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
    scrollOffset = readScrollToOffsetOnAxis({ request, axis }) ?? scrollOffset;
  }

  return scrollOffset;
};
