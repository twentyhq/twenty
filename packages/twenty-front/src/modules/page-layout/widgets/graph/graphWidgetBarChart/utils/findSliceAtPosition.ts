import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { findAnchorBarInSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findAnchorBarInSlice';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

type FindSliceAtPositionParams = {
  event: MouseEvent<SVGRectElement>;
  slices: BarChartSlice[];
  marginLeft: number;
  marginTop: number;
  isVerticalLayout: boolean;
};

type SliceAtPositionResult = {
  slice: BarChartSlice;
  offsetLeft: number;
  offsetTop: number;
};

export const findSliceAtPosition = ({
  event,
  slices,
  marginLeft,
  marginTop,
  isVerticalLayout,
}: FindSliceAtPositionParams): SliceAtPositionResult | null => {
  const svgBoundingRectangle =
    event.currentTarget.ownerSVGElement?.getBoundingClientRect();

  if (!isDefined(svgBoundingRectangle) || slices.length === 0) {
    return null;
  }

  const mousePositionX = event.clientX - svgBoundingRectangle.left - marginLeft;
  const mousePositionY = event.clientY - svgBoundingRectangle.top - marginTop;

  const positionAlongAxis = isVerticalLayout ? mousePositionX : mousePositionY;

  const nearestSlice = slices.reduce((nearest, slice) => {
    const currentDistance = Math.abs(slice.sliceCenter - positionAlongAxis);
    const nearestDistance = Math.abs(nearest.sliceCenter - positionAlongAxis);
    return currentDistance < nearestDistance ? slice : nearest;
  });

  const anchorBar = findAnchorBarInSlice(nearestSlice.bars, isVerticalLayout);

  const offsetLeft = isVerticalLayout
    ? nearestSlice.sliceCenter + marginLeft
    : anchorBar.absX + anchorBar.width + marginLeft;
  const offsetTop = isVerticalLayout
    ? anchorBar.absY + marginTop
    : nearestSlice.sliceCenter + marginTop;

  return {
    slice: nearestSlice,
    offsetLeft,
    offsetTop,
  };
};
