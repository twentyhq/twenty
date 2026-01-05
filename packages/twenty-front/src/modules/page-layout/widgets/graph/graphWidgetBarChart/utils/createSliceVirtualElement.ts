import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { findAnchorBar } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findAnchorBar';
import { type VirtualElement } from '@floating-ui/react';
import { BarChartLayout } from '~/generated/graphql';

type CreateSliceVirtualElementParams = {
  slice: BarChartSlice;
  svgBoundingRectangle: DOMRect;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
};

export const createSliceVirtualElement = ({
  slice,
  svgBoundingRectangle,
  layout,
  groupMode,
}: CreateSliceVirtualElementParams): VirtualElement => {
  const anchorBar = findAnchorBar(slice.bars, layout, groupMode);
  const isVertical = layout === BarChartLayout.VERTICAL;

  const thicknessDimension = isVertical ? anchorBar.width : anchorBar.height;
  const constrainedThickness = Math.min(
    thicknessDimension,
    BAR_CHART_CONSTANTS.MAXIMUM_WIDTH,
  );
  const centeringOffset =
    thicknessDimension > BAR_CHART_CONSTANTS.MAXIMUM_WIDTH
      ? (thicknessDimension - BAR_CHART_CONSTANTS.MAXIMUM_WIDTH) / 2
      : 0;

  const left =
    svgBoundingRectangle.left +
    anchorBar.absX +
    (isVertical ? centeringOffset : anchorBar.width);
  const top =
    svgBoundingRectangle.top +
    anchorBar.absY +
    (isVertical ? 0 : centeringOffset);
  const width = isVertical ? constrainedThickness : 1;
  const height = isVertical ? 1 : constrainedThickness;

  return {
    getBoundingClientRect: () => new DOMRect(left, top, width, height),
  };
};
