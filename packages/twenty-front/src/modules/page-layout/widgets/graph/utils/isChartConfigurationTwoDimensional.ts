import { type GroupByChartConfiguration } from '@/page-layout/widgets/graph/types/GroupByChartConfiguration';
import { isDefined } from 'twenty-shared/utils';

export const isChartConfigurationTwoDimensional = (
  configuration: GroupByChartConfiguration,
): boolean => {
  return isDefined(configuration.secondaryAxisGroupByFieldMetadataId);
};
