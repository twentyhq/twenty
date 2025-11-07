import { type VirtualElement } from '@floating-ui/react';

type Coords = {
  left: number;
  top: number;
};

export const createVirtualElementFromChartCoordinates = (
  coords: Coords,
): VirtualElement => {
  const { left, top } = coords;
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
