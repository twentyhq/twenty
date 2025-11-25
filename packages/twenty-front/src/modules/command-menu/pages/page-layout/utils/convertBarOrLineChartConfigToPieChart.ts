import { type PieChartConvertibleFields } from '@/command-menu/pages/page-layout/types/PieChartConvertibleFields';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const convertBarOrLineChartConfigToPieChart = (
  configuration: BarChartConfiguration | LineChartConfiguration,
): PieChartConvertibleFields => {
  const configToUpdate: PieChartConvertibleFields = {};

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
