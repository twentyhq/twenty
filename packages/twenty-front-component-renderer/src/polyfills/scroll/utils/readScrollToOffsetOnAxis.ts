import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollRequest } from '@/types/ScrollRequest';

export const readScrollToOffsetOnAxis = ({
  request,
  axis,
}: {
  request: ScrollRequest;
  axis: ScrollAxis;
}): number | undefined =>
  request.method === 'scrollTo' ? request[axis] : undefined;
