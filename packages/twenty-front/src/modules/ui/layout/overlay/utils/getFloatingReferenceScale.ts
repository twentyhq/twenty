import { type MiddlewareState } from '@floating-ui/react';

export const getFloatingReferenceScale = ({
  rects,
  elements,
}: Pick<MiddlewareState, 'rects' | 'elements'>) =>
  elements.reference instanceof HTMLElement
    ? rects.reference.width / elements.reference.offsetWidth
    : 1;
