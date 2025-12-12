import { type BarLineChartConvertibleFields } from '@/command-menu/pages/page-layout/types/BarLineChartConvertibleFields';
import { type WaffleChartConfiguration } from '~/generated/graphql';

export const convertWaffleChartConfigToBarOrLineChart = (
  configuration: WaffleChartConfiguration,
): BarLineChartConvertibleFields => {
  if (configuration.__typename !== 'WaffleChartConfiguration') {
    return {};
  }

  return {
    primaryAxisGroupByFieldMetadataId: configuration.groupByFieldMetadataId,
    primaryAxisGroupBySubFieldName: configuration.groupBySubFieldName,
    primaryAxisDateGranularity: configuration.dateGranularity,
    primaryAxisOrderBy: configuration.orderBy,
  };
};
