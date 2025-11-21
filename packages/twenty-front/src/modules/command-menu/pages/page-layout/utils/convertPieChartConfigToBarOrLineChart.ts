import { type ChartConfiguration } from '@/command-menu/pages/page-layout/types/ChartConfiguration';

export const convertPieChartConfigToBarOrLineChart = (
  configuration: ChartConfiguration,
): Record<string, any> => {
  const configToUpdate: Record<string, any> = {};

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
