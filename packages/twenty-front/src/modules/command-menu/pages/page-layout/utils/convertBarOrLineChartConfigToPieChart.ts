import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';

export const convertBarOrLineChartConfigToPieChart = (
  configuration: ChartConfiguration,
): Record<string, any> => {
  const configToUpdate: Record<string, any> = {};

  if ('primaryAxisGroupByFieldMetadataId' in configuration) {
    configToUpdate.groupByFieldMetadataId =
      configuration.primaryAxisGroupByFieldMetadataId;
  }

  if ('primaryAxisGroupBySubFieldName' in configuration) {
    configToUpdate.groupBySubFieldName =
      configuration.primaryAxisGroupBySubFieldName;
  }

  if ('primaryAxisDateGranularity' in configuration) {
    configToUpdate.dateGranularity = configuration.primaryAxisDateGranularity;
  }

  if ('primaryAxisOrderBy' in configuration) {
    configToUpdate.orderBy = configuration.primaryAxisOrderBy;
  }

  return configToUpdate;
};
