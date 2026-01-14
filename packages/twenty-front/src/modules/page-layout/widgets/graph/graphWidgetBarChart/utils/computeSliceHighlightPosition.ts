import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';

type ComputeSliceHighlightPositionParams = {
  sliceCenter: number | null;
  isVerticalLayout: boolean;
  innerWidth: number;
  innerHeight: number;
};

type SliceHighlightPosition = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const computeSliceHighlightPosition = ({
  sliceCenter,
  isVerticalLayout,
  innerWidth,
  innerHeight,
}: ComputeSliceHighlightPositionParams): SliceHighlightPosition => {
  const center = sliceCenter ?? 0;
  const halfThickness = BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS / 2;

  return {
    x: isVerticalLayout ? center - halfThickness : 0,
    y: isVerticalLayout ? 0 : center - halfThickness,
    width: isVerticalLayout
      ? BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS
      : innerWidth,
    height: isVerticalLayout
      ? innerHeight
      : BAR_CHART_CONSTANTS.SLICE_HIGHLIGHT_THICKNESS,
  };
};
