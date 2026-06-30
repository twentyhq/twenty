import { type VirtualElement } from '@floating-ui/react';
import { isDefined } from 'twenty-shared/utils';

export const createVirtualElementFromSVGElement = (
  svgElement: Element,
): VirtualElement | null => {
  const svgContainer = svgElement.closest('svg');
  if (!isDefined(svgContainer)) {
    return null;
  }

  return {
    getBoundingClientRect: () => {
      const elementRect = svgElement.getBoundingClientRect();
      return new DOMRect(
        elementRect.left,
        elementRect.top,
        elementRect.width,
        1,
      );
    },
  };
};
