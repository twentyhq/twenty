import { type VirtualElement } from '@floating-ui/react';
import { isDefined } from 'twenty-shared/utils';

export const getTooltipReferenceFromBarChartElementAnchor = (
  anchorElement: Element,
  containerId: string,
): {
  reference: Element | VirtualElement;
  boundary: Element;
} => {
  const containerElement = document.getElementById(containerId);

  if (!isDefined(containerElement)) {
    throw new Error(`Bar chart container not found: ${containerId}`);
  }

  return { reference: anchorElement, boundary: containerElement };
};
