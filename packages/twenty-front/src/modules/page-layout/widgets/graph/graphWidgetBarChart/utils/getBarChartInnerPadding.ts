import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { BarChartLayout } from '~/generated/graphql';

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
    return BAR_CHART_CONSTANTS.DEFAULT_INNER_PADDING;
  }

  const availableSpace =
    layout === BarChartLayout.VERTICAL
      ? chartWidth - margins.left - margins.right
      : chartHeight - margins.top - margins.bottom;

  const spacePerGroup =
    (availableSpace / dataLength) *
    (1 - BAR_CHART_CONSTANTS.OUTER_PADDING_RATIO);

  const spacePerBar = spacePerGroup / keysLength;

  if (
    spacePerBar <
    BAR_CHART_CONSTANTS.MINIMUM_BAR_WIDTH +
      BAR_CHART_CONSTANTS.DEFAULT_INNER_PADDING
  ) {
    return Math.max(
      0,
      (spacePerBar - BAR_CHART_CONSTANTS.MINIMUM_BAR_WIDTH) / 2,
    );
  }

  return BAR_CHART_CONSTANTS.DEFAULT_INNER_PADDING;
};
