import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { isWidgetConfigurationOfType } from '@/side-panel/pages/page-layout/utils/isWidgetConfigurationOfType';
import { isDefined } from 'twenty-shared/utils';

export const getChartConfigurationFieldMetadataIds = (
  configuration: PageLayoutWidget['configuration'],
): string[] => {
  if (
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration')
  ) {
    return [
      configuration.aggregateFieldMetadataId,
      configuration.primaryAxisGroupByFieldMetadataId,
      configuration.secondaryAxisGroupByFieldMetadataId,
    ].filter(isDefined);
  }

  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return [
      configuration.aggregateFieldMetadataId,
      configuration.groupByFieldMetadataId,
    ].filter(isDefined);
  }

  if (
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration')
  ) {
    return [configuration.aggregateFieldMetadataId].filter(isDefined);
  }

  return [];
};
