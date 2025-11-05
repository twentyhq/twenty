import { type VirtualElement } from '@floating-ui/react';
import { type BarDatum, type ComputedDatum } from '@nivo/bar';
import { isDefined } from 'twenty-shared/utils';

export type BarDatumWithGeometry = ComputedDatum<BarDatum> & {
  barElement?: SVGElement;
  barAbsoluteX?: number;
  barAbsoluteY?: number;
  barWidth?: number;
  barHeight?: number;
};

export const createFloatingAnchorFromBarGeometry = (
  datum: BarDatumWithGeometry,
): VirtualElement | null => {
  if (
    !isDefined(datum.barElement) ||
    !isDefined(datum.barAbsoluteX) ||
    !isDefined(datum.barAbsoluteY) ||
    !isDefined(datum.barWidth)
  ) {
    return null;
  }

  return {
    getBoundingClientRect: () => {
      const barElementRectangle = datum.barElement!.getBoundingClientRect();
      const svgContainerRectangle = datum
        .barElement!.closest('svg')
        ?.getBoundingClientRect();

      if (!svgContainerRectangle) {
        return barElementRectangle;
      }

      return {
        left: svgContainerRectangle.left + datum.barAbsoluteX!,
        right:
          svgContainerRectangle.left + datum.barAbsoluteX! + datum.barWidth!,
        top: svgContainerRectangle.top + datum.barAbsoluteY!,
        bottom: svgContainerRectangle.top + datum.barAbsoluteY! + 1,
        width: datum.barWidth!,
        height: 1,
        x: svgContainerRectangle.left + datum.barAbsoluteX!,
        y: svgContainerRectangle.top + datum.barAbsoluteY!,
      } as DOMRect;
    },
  };
};
