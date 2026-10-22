import { type ScrollAxis } from '@/types/ScrollAxis';
import { type ScrollPositionRequest } from '@/types/ScrollPositionRequest';

export const createScrollPositionRequest = ({
  axis,
  offset,
}: {
  axis: ScrollAxis;
  offset: number;
}): ScrollPositionRequest =>
  axis === 'top'
    ? { method: 'scrollTo', top: offset }
    : { method: 'scrollTo', left: offset };
