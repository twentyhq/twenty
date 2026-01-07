import { type BarLineChartConvertibleFields } from '@/command-menu/pages/page-layout/types/BarLineChartConvertibleFields';
import { isWidgetConfigurationOfType } from '@/command-menu/pages/page-layout/utils/isWidgetConfigurationOfType';
import { type PieChartConfiguration } from '~/generated/graphql';

export const convertPieChartConfigToBarOrLineChart = (
  configuration: PieChartConfiguration,
): BarLineChartConvertibleFields => {
  if (!isWidgetConfigurationOfType(configuration, 'PieChartConfiguration')) {
    return {};
  }

  return {
    primaryAxisGroupByFieldMetadataId: configuration.groupByFieldMetadataId,
    primaryAxisGroupBySubFieldName: configuration.groupBySubFieldName,
    primaryAxisDateGranularity: configuration.dateGranularity,
    primaryAxisOrderBy: configuration.orderBy,
  };
};
