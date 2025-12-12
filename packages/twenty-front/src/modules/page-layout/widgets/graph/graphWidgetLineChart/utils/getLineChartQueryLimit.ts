import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups';
import { LINE_CHART_CONSTANTS } from '@/page-layout/widgets/graph/graphWidgetLineChart/constants/LineChartConstants';
import { isChartConfigurationTwoDimensional } from '@/page-layout/widgets/graph/utils/isChartConfigurationTwoDimensional';
import { type LineChartConfiguration } from '~/generated/graphql';

export const getLineChartQueryLimit = (
  configuration: LineChartConfiguration,
): number => {
  const isTwoDimensional = isChartConfigurationTwoDimensional(configuration);

  if (!isTwoDimensional) {
    return (
      LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS +
      EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
    );
  }

  if (configuration.isStacked === true) {
    return (
      LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS *
        LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_STACKED_SERIES +
      EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
    );
  }

  return (
    LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_DATA_POINTS *
      LINE_CHART_CONSTANTS.MAXIMUM_NUMBER_OF_NON_STACKED_SERIES +
    EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
  );
};
