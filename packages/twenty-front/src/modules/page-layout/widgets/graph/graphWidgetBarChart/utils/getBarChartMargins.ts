import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { isDefined } from 'twenty-shared/utils';
import { BarChartLayout } from '~/generated/graphql';

const BAR_CHART_MARGINS = {
  top: COMMON_CHART_CONSTANTS.MARGIN_TOP,
  right: COMMON_CHART_CONSTANTS.MARGIN_RIGHT,
  bottom: COMMON_CHART_CONSTANTS.MARGIN_BOTTOM_WITHOUT_LABEL,
  left: COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITHOUT_LABEL,
} as const;

const BAR_CHART_MARGINS_WITH_BOTH_LABELS = {
  top: COMMON_CHART_CONSTANTS.MARGIN_TOP,
  right: COMMON_CHART_CONSTANTS.MARGIN_RIGHT,
  bottom: COMMON_CHART_CONSTANTS.MARGIN_BOTTOM_WITH_LABEL,
  left: COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITH_LABEL,
} as const;

const BAR_CHART_MARGINS_WITH_X_LABEL = {
  top: COMMON_CHART_CONSTANTS.MARGIN_TOP,
  right: COMMON_CHART_CONSTANTS.MARGIN_RIGHT,
  bottom: COMMON_CHART_CONSTANTS.MARGIN_BOTTOM_WITH_LABEL,
  left: COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITHOUT_LABEL,
} as const;

const BAR_CHART_MARGINS_WITH_Y_LABEL = {
  top: COMMON_CHART_CONSTANTS.MARGIN_TOP,
  right: COMMON_CHART_CONSTANTS.MARGIN_RIGHT,
  bottom: COMMON_CHART_CONSTANTS.MARGIN_BOTTOM_WITHOUT_LABEL,
  left: COMMON_CHART_CONSTANTS.MARGIN_LEFT_WITH_LABEL,
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
