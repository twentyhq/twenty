import { type MiddlewareState } from '@floating-ui/react';

export const getFloatingReferenceScale = ({
  rects,
  elements,
}: {
  rects: { reference: Pick<MiddlewareState['rects']['reference'], 'width'> };
  elements: { reference: MiddlewareState['elements']['reference'] | null };
}) =>
  elements.reference instanceof HTMLElement &&
  elements.reference.offsetWidth > 0
    ? rects.reference.width / elements.reference.offsetWidth
    : 1;
