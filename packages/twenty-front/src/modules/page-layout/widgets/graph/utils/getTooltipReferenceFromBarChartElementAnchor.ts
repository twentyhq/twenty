import { type VirtualElement } from '@floating-ui/react';

export const getTooltipReferenceFromBarChartElementAnchor = (
  anchorElement: Element,
): {
  reference: Element | VirtualElement | null;
  boundary: Element | null;
} => {
  const containerElement = anchorElement.closest('[id]');
  return { reference: anchorElement, boundary: containerElement };
};
