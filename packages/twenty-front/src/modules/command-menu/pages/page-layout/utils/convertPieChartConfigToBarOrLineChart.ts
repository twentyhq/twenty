import { type BarLineChartConvertibleFields } from '@/command-menu/pages/page-layout/types/BarLineChartConvertibleFields';
import { type PieChartConfiguration } from '~/generated/graphql';

export const convertPieChartConfigToBarOrLineChart = (
  configuration: PieChartConfiguration,
): BarLineChartConvertibleFields => {
  const configToUpdate: BarLineChartConvertibleFields = {};

  if ('groupByFieldMetadataId' in configuration) {
    configToUpdate.primaryAxisGroupByFieldMetadataId =
      configuration.groupByFieldMetadataId;
  }

  if ('groupBySubFieldName' in configuration) {
    configToUpdate.primaryAxisGroupBySubFieldName =
      configuration.groupBySubFieldName;
  }

  if ('dateGranularity' in configuration) {
    configToUpdate.primaryAxisDateGranularity = configuration.dateGranularity;
  }

  if ('orderBy' in configuration) {
    configToUpdate.primaryAxisOrderBy = configuration.orderBy;
  }

  return configToUpdate;
};
