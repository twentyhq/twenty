import { type PieChartConfiguration } from '~/generated/graphql';

export const convertPieChartConfigToBarOrLineChart = (
  configuration: PieChartConfiguration,
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
