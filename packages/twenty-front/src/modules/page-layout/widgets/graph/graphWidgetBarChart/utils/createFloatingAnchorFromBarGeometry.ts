import { type VirtualElement } from '@floating-ui/react';
import { isDefined } from 'twenty-shared/utils';

export type BarGeometry = {
  element: SVGElement;
  width: number;
  height: number;
  absoluteX: number;
  absoluteY: number;
};

export const createFloatingAnchorFromBarGeometry = (
  geometry: BarGeometry,
): VirtualElement | null => {
  if (
    !isDefined(geometry.element) ||
    !isDefined(geometry.absoluteX) ||
    !isDefined(geometry.absoluteY) ||
    !isDefined(geometry.width)
  ) {
    return null;
  }

  return {
    getBoundingClientRect: () => {
      const barElementRectangle = geometry.element.getBoundingClientRect();
      const svgContainerRectangle = geometry.element
        .closest('svg')
        ?.getBoundingClientRect();

      if (!svgContainerRectangle) {
        return barElementRectangle;
      }

      return {
        left: svgContainerRectangle.left + geometry.absoluteX,
        right: svgContainerRectangle.left + geometry.absoluteX + geometry.width,
        top: svgContainerRectangle.top + geometry.absoluteY,
        bottom: svgContainerRectangle.top + geometry.absoluteY + 1,
        width: geometry.width,
        height: 1,
        x: svgContainerRectangle.left + geometry.absoluteX,
        y: svgContainerRectangle.top + geometry.absoluteY,
      };
    },
  };
};
