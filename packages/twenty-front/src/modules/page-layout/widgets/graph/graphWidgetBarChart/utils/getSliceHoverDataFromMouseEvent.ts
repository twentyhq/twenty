import { getPointerPosition } from '@/page-layout/widgets/graph/chart-core/utils/getPointerPosition';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSliceHoverData';
import { getSliceHoverDataFromPointerPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/getSliceHoverDataFromPointerPosition';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';
import { type MouseEvent } from 'react';

type GetSliceHoverDataFromMouseEventParams = {
  event: MouseEvent<HTMLDivElement>;
  margins: ChartMargins;
  innerWidth: number;
  innerHeight: number;
  slices: BarChartSlice[];
  isVerticalLayout: boolean;
};

export const getSliceHoverDataFromMouseEvent = ({
  event,
  margins,
  innerWidth,
  innerHeight,
  slices,
  isVerticalLayout,
}: GetSliceHoverDataFromMouseEventParams): BarChartSliceHoverData | null => {
  const { x: pointerPositionX, y: pointerPositionY } = getPointerPosition({
    event,
    element: event.currentTarget,
  });

  return getSliceHoverDataFromPointerPosition({
    pointerPositionX,
    pointerPositionY,
    margins,
    innerWidth,
    innerHeight,
    slices,
    isVerticalLayout,
  });
};
