import { type FieldConfiguration } from '@/page-layout/types/FieldConfiguration';
import { type FieldsConfiguration } from '@/page-layout/types/FieldsConfiguration';
import { isDefined } from 'twenty-shared/utils';
import { type WidgetConfiguration } from '~/generated-metadata/graphql';

export const hasMinimalRequiredConfigForGraph = (
  configuration: WidgetConfiguration | FieldsConfiguration | FieldConfiguration,
): boolean => {
  switch (configuration.__typename) {
    case 'BarChartConfiguration':
    case 'LineChartConfiguration':
      return (
        isDefined(configuration.aggregateFieldMetadataId) &&
        isDefined(configuration.primaryAxisGroupByFieldMetadataId)
      );

    case 'PieChartConfiguration':
      return (
        isDefined(configuration.aggregateFieldMetadataId) &&
        isDefined(configuration.groupByFieldMetadataId)
      );

    case 'AggregateChartConfiguration':
    case 'GaugeChartConfiguration':
      return isDefined(configuration.aggregateFieldMetadataId);

    default:
      return false;
  }
};
