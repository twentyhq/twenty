import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { isDefined } from 'twenty-shared/utils';
import { type WidgetConfiguration } from '~/generated-metadata/graphql';

export const hasMinimalRequiredConfigForGraph = (
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration,
): boolean => {
  if (
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration')
  ) {
    return (
      isDefined(configuration.aggregateFieldMetadataId) &&
      isDefined(configuration.primaryAxisGroupByFieldMetadataId)
    );
  }

  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return (
      isDefined(configuration.aggregateFieldMetadataId) &&
      isDefined(configuration.groupByFieldMetadataId)
    );
  }

  if (
    isWidgetConfigurationOfType(configuration, 'AggregateChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'GaugeChartConfiguration')
  ) {
    return isDefined(configuration.aggregateFieldMetadataId);
  }

  return false;
};
