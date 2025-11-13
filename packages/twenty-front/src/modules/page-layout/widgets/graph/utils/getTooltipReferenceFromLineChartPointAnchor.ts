import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type VirtualElement } from '@floating-ui/react';
import { isDefined } from 'twenty-shared/utils';

export const getTooltipReferenceFromLineChartPointAnchor = (
  containerId: string,
  offsetLeft: number,
  offsetTop: number,
): {
  reference: VirtualElement;
  boundary: Element;
} => {
  const containerElement = document.getElementById(containerId);

  if (!isDefined(containerElement)) {
    throw new Error(`Chart container not found: ${containerId}`);
  }

  return {
    reference: createVirtualElementFromContainerOffset(
      containerElement,
      offsetLeft,
      offsetTop,
    ),
    boundary: containerElement,
  };
};
