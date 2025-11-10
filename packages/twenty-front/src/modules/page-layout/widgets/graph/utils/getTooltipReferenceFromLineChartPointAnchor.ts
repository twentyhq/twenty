import { createVirtualElementFromChartCoordinates } from '@/page-layout/widgets/graph/utils/createVirtualElementFromChartCoordinates';
import { createVirtualElementFromContainerOffset } from '@/page-layout/widgets/graph/utils/createVirtualElementFromContainerOffset';
import { type VirtualElement } from '@floating-ui/react';
import { isDefined } from 'twenty-shared/utils';

export const getTooltipReferenceFromLineChartPointAnchor = (
  containerId: string,
  offsetLeft: number,
  offsetTop: number,
): {
  reference: Element | VirtualElement | null;
  boundary: Element | null;
} => {
  const containerElement = document.getElementById(containerId);

  if (isDefined(containerElement)) {
    return {
      reference: createVirtualElementFromContainerOffset(
        containerElement,
        offsetLeft,
        offsetTop,
      ),
      boundary: containerElement,
    };
  }

  return {
    reference: createVirtualElementFromChartCoordinates({
      left: offsetLeft,
      top: offsetTop,
    }),
    boundary: null,
  };
};
