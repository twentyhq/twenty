import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type VirtualElement } from '@floating-ui/react';
import { BarChartLayout } from '~/generated/graphql';

type CreateSliceVirtualElementParams = {
  slice: BarChartSlice;
  svgRect: DOMRect;
  marginLeft: number;
  marginTop: number;
  layout: BarChartLayout;
};

export const createSliceVirtualElement = ({
  slice,
  svgRect,
  marginLeft,
  marginTop,
  layout,
}: CreateSliceVirtualElementParams): VirtualElement => {
  const isVertical = layout === BarChartLayout.VERTICAL;

  const left = svgRect.left + marginLeft + slice.anchorX;
  const top = svgRect.top + marginTop + slice.anchorY;
  const width = slice.sliceRight - slice.sliceLeft;

  return {
    getBoundingClientRect: () =>
      new DOMRect(
        isVertical ? left - width / 2 : left,
        top,
        isVertical ? width : 1,
        1,
      ),
  };
};
