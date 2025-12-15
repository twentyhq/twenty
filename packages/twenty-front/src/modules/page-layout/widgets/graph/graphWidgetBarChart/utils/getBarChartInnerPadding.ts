import { BAR_CHART_DEFAULT_INNER_PADDING } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartDefaultInnerPadding';
import { BAR_CHART_OUTER_PADDING_RATIO } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartOuterPaddingRatio';
import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';

type BarChartMargins = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

type GetBarChartInnerPaddingProps = {
  chartWidth: number;
  chartHeight: number;
  dataLength: number;
  keysLength: number;
  layout: BarChartLayout;
  margins: BarChartMargins;
  groupMode?: 'grouped' | 'stacked';
};

const MINIMUM_BAR_WIDTH = 2;

export const getBarChartInnerPadding = ({
  chartWidth,
  chartHeight,
  dataLength,
  keysLength,
  layout,
  margins,
  groupMode,
}: GetBarChartInnerPaddingProps): number => {
  if (groupMode !== 'grouped') {
    return 0;
  }

  if (dataLength === 0 || keysLength === 0) {
    return BAR_CHART_DEFAULT_INNER_PADDING;
  }

  const availableSpace =
    layout === BarChartLayout.VERTICAL
      ? chartWidth - margins.left - margins.right
      : chartHeight - margins.top - margins.bottom;

  const spacePerGroup =
    (availableSpace / dataLength) * (1 - BAR_CHART_OUTER_PADDING_RATIO);

  const spacePerBar = spacePerGroup / keysLength;

  if (spacePerBar < MINIMUM_BAR_WIDTH + BAR_CHART_DEFAULT_INNER_PADDING) {
    return Math.max(0, (spacePerBar - MINIMUM_BAR_WIDTH) / 2);
  }

  return BAR_CHART_DEFAULT_INNER_PADDING;
};
