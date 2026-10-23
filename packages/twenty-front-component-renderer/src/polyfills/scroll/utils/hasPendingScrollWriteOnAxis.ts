import { isDefined } from 'twenty-shared/utils';

import { readScrollToOffsetOnAxis } from '@/polyfills/scroll/utils/readScrollToOffsetOnAxis';
import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollCommand } from '@/types/ScrollCommand';

export const hasPendingScrollWriteOnAxis = ({
  pendingCommands,
  axis,
}: {
  pendingCommands: ScrollCommand[];
  axis: ScrollAxis;
}): boolean =>
  pendingCommands.some(({ request }) =>
    isDefined(readScrollToOffsetOnAxis({ request, axis })),
  );
