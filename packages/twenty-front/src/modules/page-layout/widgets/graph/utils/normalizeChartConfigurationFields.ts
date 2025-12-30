import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import {
  type BarChartConfiguration,
  type GraphOrderBy,
  type LineChartConfiguration,
  type ObjectRecordGroupByDateGranularity,
  type PieChartConfiguration,
} from '~/generated-metadata/graphql';

export type NormalizedChartConfigurationFields = {
  groupByFieldMetadataId?: string;
  groupBySubFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  orderBy?: GraphOrderBy | null;
};

export const normalizeChartConfigurationFields = (
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration,
): NormalizedChartConfigurationFields => {
  const isBarOrLineChart =
    isWidgetConfigurationOfType(configuration, 'BarChartConfiguration') ||
    isWidgetConfigurationOfType(configuration, 'LineChartConfiguration');

  if (isBarOrLineChart) {
    return {
      groupByFieldMetadataId: configuration.primaryAxisGroupByFieldMetadataId,
      groupBySubFieldName: configuration.primaryAxisGroupBySubFieldName,
      dateGranularity: configuration.primaryAxisDateGranularity,
      orderBy: configuration.primaryAxisOrderBy,
    };
  }

  if (isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return {
      groupByFieldMetadataId: configuration.groupByFieldMetadataId,
      groupBySubFieldName: configuration.groupBySubFieldName,
      dateGranularity: configuration.dateGranularity,
      orderBy: configuration.orderBy,
    };
  }

  return {};
};
