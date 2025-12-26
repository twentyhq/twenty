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
    getBoundingClientRect: () => new DOMRect(left, top, 1, 1),
  };
};
