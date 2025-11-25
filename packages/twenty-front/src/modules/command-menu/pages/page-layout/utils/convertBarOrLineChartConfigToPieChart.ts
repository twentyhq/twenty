import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const convertBarOrLineChartConfigToPieChart = (
  configuration: BarChartConfiguration | LineChartConfiguration,
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
