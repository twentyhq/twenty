import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type VirtualElement } from '@floating-ui/react';
import { BarChartLayout } from '~/generated/graphql';

type CreateSliceVirtualElementParams = {
  slice: BarChartSlice;
  svgBoundingRectangle: DOMRect;
  layout: BarChartLayout;
  groupMode: 'grouped' | 'stacked';
};

const findAnchorBar = (
  bars: BarChartSlice['bars'],
  layout: BarChartLayout,
  groupMode: 'grouped' | 'stacked',
) => {
  if (groupMode === 'grouped') {
    return bars[0];
  }

  const isVertical = layout === BarChartLayout.VERTICAL;

  return bars.reduce((anchor, bar) => {
    if (isVertical) {
      return bar.y < anchor.y ? bar : anchor;
    }
    return bar.x + bar.width > anchor.x + anchor.width ? bar : anchor;
  }, bars[0]);
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
