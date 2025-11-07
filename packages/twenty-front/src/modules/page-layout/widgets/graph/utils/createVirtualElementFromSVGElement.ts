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

      return {
        left: elementRect.left,
        right: elementRect.right,
        top: elementRect.top,
        bottom: elementRect.top + 1,
        width: elementRect.width,
        height: 1,
        x: elementRect.left,
        y: elementRect.top,
      };
    },
  };
};
