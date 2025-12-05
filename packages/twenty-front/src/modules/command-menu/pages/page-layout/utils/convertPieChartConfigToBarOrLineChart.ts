import { type BarLineChartConvertibleFields } from '@/command-menu/pages/page-layout/types/BarLineChartConvertibleFields';
import { type PieChartConfiguration } from '~/generated/graphql';

export const convertPieChartConfigToBarOrLineChart = (
  configuration: PieChartConfiguration,
): BarLineChartConvertibleFields => {
  if (configuration.__typename !== 'PieChartConfiguration') {
    return {};
  }

  return {
    primaryAxisGroupByFieldMetadataId: configuration.groupByFieldMetadataId,
    primaryAxisGroupBySubFieldName: configuration.groupBySubFieldName,
    primaryAxisDateGranularity: configuration.dateGranularity,
    primaryAxisOrderBy: configuration.orderBy,
  };
};
