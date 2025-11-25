import { type GroupByChartConfiguration } from '@/page-layout/widgets/graph/types/GroupByChartConfiguration';
import { isDefined } from 'twenty-shared/utils';
import { BarChartGroupMode } from '~/generated-metadata/graphql';

export const isChartConfigurationTwoDimensionalStacked = (
  configuration: GroupByChartConfiguration,
): boolean => {
  const hasTwoDimensions = isDefined(
    configuration.secondaryAxisGroupByFieldMetadataId,
  );

  if (!hasTwoDimensions) {
    return false;
  }

  if (configuration.__typename === 'BarChartConfiguration') {
    return configuration.groupMode === BarChartGroupMode.STACKED;
  }

  if (configuration.__typename === 'LineChartConfiguration') {
    return configuration.isStacked === true;
  }

  return false;
};
