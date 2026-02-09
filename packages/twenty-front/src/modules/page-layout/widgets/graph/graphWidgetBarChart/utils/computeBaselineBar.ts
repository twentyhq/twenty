import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';

type ComputeBaselineBarParams = {
  bar: BarPosition;
  innerHeight: number;
  zeroPixel: number;
  isVertical: boolean;
};

export const computeBaselineBar = ({
  bar,
  innerHeight,
  zeroPixel,
  isVertical,
}: ComputeBaselineBarParams): BarPosition => {
  const baselineY = innerHeight - zeroPixel;

  if (isVertical) {
    return {
      ...bar,
      y: baselineY,
      height: 0,
      value: 0,
    };
  }

  return {
    ...bar,
    x: zeroPixel,
    width: 0,
    value: 0,
  };
};
