import { getDateGranularityPluralLabel } from '@/command-menu/pages/page-layout/utils/getDateGranularityPluralLabel';
import { BAR_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartConstants';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { PIE_CHART_MAXIMUM_NUMBER_OF_SLICES } from '@/page-layout/widgets/graph/graphWidgetPieChart/constants/PieChartMaximumNumberOfSlices.constant';
import { t } from '@lingui/core/macro';
import { type ObjectRecordGroupByDateGranularity } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { WidgetConfigurationType } from '~/generated/graphql';

type GetChartLimitMessageParams = {
  widgetConfigurationType: WidgetConfigurationType;
  isPrimaryAxisDate: boolean;
  primaryAxisDateGranularity:
    | ObjectRecordGroupByDateGranularity
    | null
    | undefined;
};

export const getChartLimitMessage = ({
  widgetConfigurationType,
  isPrimaryAxisDate,
  primaryAxisDateGranularity,
}: GetChartLimitMessageParams): string => {
  const maxItems =
    widgetConfigurationType === WidgetConfigurationType.LINE_CHART
      ? LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS
      : widgetConfigurationType === WidgetConfigurationType.BAR_CHART
        ? BAR_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_BARS
        : PIE_CHART_MAXIMUM_NUMBER_OF_SLICES;

  if (isPrimaryAxisDate && isDefined(primaryAxisDateGranularity)) {
    const granularityLabel = getDateGranularityPluralLabel(
      primaryAxisDateGranularity,
    );
    return t`Undisplayed data: max ${maxItems} ${granularityLabel} per chart.`;
  }

  if (widgetConfigurationType === WidgetConfigurationType.LINE_CHART) {
    return t`Undisplayed data: max ${maxItems} data points per chart.`;
  }

  if (widgetConfigurationType === WidgetConfigurationType.BAR_CHART) {
    return t`Undisplayed data: max ${maxItems} bars per chart.`;
  }

  return t`Undisplayed data: max ${maxItems} slices per chart.`;
};
