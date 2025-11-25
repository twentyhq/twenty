import { EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS } from '@/page-layout/widgets/graph/constants/ExtraItemToDetectTooManyGroups.constant';
import { BAR_CHART_MAXIMUM_NUMBER_OF_BARS } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMaximumNumberOfBars.constant';
import { BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR } from '@/page-layout/widgets/graph/graphWidgetBarChart/constants/BarChartMaximumNumberOfGroupsPerBar.constant';
import { isDefined } from 'twenty-shared/utils';
import {
  BarChartGroupMode,
  type BarChartConfiguration,
} from '~/generated/graphql';

export const getBarChartQueryLimit = (
  configuration: BarChartConfiguration,
): number => {
  if (
    isDefined(configuration.secondaryAxisGroupByFieldMetadataId) &&
    configuration.groupMode === BarChartGroupMode.STACKED
  ) {
    return (
      BAR_CHART_MAXIMUM_NUMBER_OF_BARS *
        BAR_CHART_MAXIMUM_NUMBER_OF_GROUPS_PER_BAR +
      EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
    );
  }

  return (
    BAR_CHART_MAXIMUM_NUMBER_OF_BARS + EXTRA_ITEM_TO_DETECT_TOO_MANY_GROUPS
  );
};
