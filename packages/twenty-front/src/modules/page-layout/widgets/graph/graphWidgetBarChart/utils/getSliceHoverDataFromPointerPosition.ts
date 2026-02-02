import { isPointInChartArea } from '@/page-layout/widgets/graph/chart-core/utils/isPointInChartArea';
import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { type BarChartSliceHoverData } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSliceHoverData';
import { computeSliceTooltipPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeSliceTooltipPosition';
import { findSliceAtPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/findSliceAtPosition';
import { type ChartMargins } from '@/page-layout/widgets/graph/types/ChartMargins';

type GetSliceHoverDataFromPointerPositionParams = {
  pointerPositionX: number;
  pointerPositionY: number;
  margins: ChartMargins;
  innerWidth: number;
  innerHeight: number;
  slices: BarChartSlice[];
  isVerticalLayout: boolean;
};

export const getSliceHoverDataFromPointerPosition = ({
  pointerPositionX,
  pointerPositionY,
  margins,
  innerWidth,
  innerHeight,
  slices,
  isVerticalLayout,
}: GetSliceHoverDataFromPointerPositionParams): BarChartSliceHoverData | null => {
  const relativePointerPositionX = pointerPositionX - margins.left;
  const relativePointerPositionY = pointerPositionY - margins.top;

  if (
    !isPointInChartArea({
      x: relativePointerPositionX,
      y: relativePointerPositionY,
      innerWidth,
      innerHeight,
    })
  ) {
    return null;
  }

  const slice = findSliceAtPosition({
    mouseX: relativePointerPositionX,
    mouseY: relativePointerPositionY,
    slices,
    isVerticalLayout,
  });

  if (!slice) {
    return null;
  }

  const { offsetLeft, offsetTop } = computeSliceTooltipPosition({
    slice,
    margins,
    innerHeight,
    isVertical: isVerticalLayout,
  });

  return { slice, offsetLeft, offsetTop };
};
