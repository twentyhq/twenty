import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type SliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/SliceHoverData';
import { createSliceVirtualElement } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/createSliceVirtualElement';
import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

type BuildSliceHoverDataParams = {
  mouseEvent: MouseEvent<SVGRectElement>;
  slices: BarChartSlice[];
  marginLeft: number;
  marginTop: number;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
};

export const buildSliceHoverData = ({
  mouseEvent,
  slices,
  marginLeft,
  marginTop,
  layout,
  groupMode,
}: BuildSliceHoverDataParams): SliceHoverData | null => {
  const svgBoundingRectangle =
    mouseEvent.currentTarget.ownerSVGElement?.getBoundingClientRect();

  if (!isDefined(svgBoundingRectangle)) {
    return null;
  }

  const isVertical = layout === BarChartLayout.VERTICAL;

  const mouseXPosition =
    mouseEvent.clientX - svgBoundingRectangle.left - marginLeft;
  const mouseYPosition =
    mouseEvent.clientY - svgBoundingRectangle.top - marginTop;

  const position = isVertical ? mouseXPosition : mouseYPosition;
  const slice = slices.find(
    (s) => position >= s.sliceLeft && position <= s.sliceRight,
  );

  if (!isDefined(slice)) {
    return null;
  }

  const virtualElement = createSliceVirtualElement({
    slice,
    svgBoundingRectangle,
    layout,
    groupMode,
  });

  return {
    slice,
    virtualElement,
  };
};
