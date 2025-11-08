import { type VirtualElement } from '@floating-ui/react';

type ChartCoordinates = {
  left: number;
  top: number;
};

export const createVirtualElementFromChartCoordinates = (
  chartCoordinates: ChartCoordinates,
): VirtualElement => {
  const { left, top } = chartCoordinates;
  return {
    getBoundingClientRect: () => {
      return {
        left,
        right: left + 1,
        top,
        bottom: top + 1,
        width: 1,
        height: 1,
        x: left,
        y: top,
      } as DOMRect;
    },
  };
};
