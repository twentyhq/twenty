import { BarChartLayout } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartLayout';
import { isDefined } from 'twenty-shared/utils';

const BAR_CHART_MARGINS = {
  top: 20,
  right: 20,
  bottom: 45,
  left: 65,
} as const;

const BAR_CHART_MARGINS_WITH_BOTH_LABELS = {
  top: 20,
  right: 20,
  bottom: 60,
  left: 80,
} as const;

const BAR_CHART_MARGINS_WITH_X_LABEL = {
  top: 20,
  right: 20,
  bottom: 60,
  left: 65,
} as const;

const BAR_CHART_MARGINS_WITH_Y_LABEL = {
  top: 20,
  right: 20,
  bottom: 45,
  left: 80,
} as const;

export const getBarChartMargins = ({
  xAxisLabel,
  yAxisLabel,
  layout,
}: {
  xAxisLabel?: string;
  yAxisLabel?: string;
  layout: BarChartLayout;
}) => {
  if (isDefined(xAxisLabel) && isDefined(yAxisLabel)) {
    return BAR_CHART_MARGINS_WITH_BOTH_LABELS;
  }

  if (isDefined(xAxisLabel)) {
    return layout === BarChartLayout.HORIZONTAL
      ? BAR_CHART_MARGINS_WITH_Y_LABEL
      : BAR_CHART_MARGINS_WITH_X_LABEL;
  }

  if (isDefined(yAxisLabel)) {
    return layout === BarChartLayout.HORIZONTAL
      ? BAR_CHART_MARGINS_WITH_X_LABEL
      : BAR_CHART_MARGINS_WITH_Y_LABEL;
  }

  return BAR_CHART_MARGINS;
};
