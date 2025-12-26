import { type BarLineChartConvertibleFields } from '@/command-menu/pages/page-layout/types/BarLineChartConvertibleFields';
import { isPieChartConfiguration } from '@/command-menu/pages/page-layout/utils/isPieChartConfiguration';
import { type PieChartConfiguration } from '~/generated/graphql';

export const convertPieChartConfigToBarOrLineChart = (
  configuration: PieChartConfiguration,
): BarLineChartConvertibleFields => {
  if (!isPieChartConfiguration(configuration)) {
    return {};
  }

  return {
    primaryAxisGroupByFieldMetadataId: configuration.groupByFieldMetadataId,
    primaryAxisGroupBySubFieldName: configuration.groupBySubFieldName,
    primaryAxisDateGranularity: configuration.dateGranularity,
    primaryAxisOrderBy: configuration.orderBy,
  };
};
