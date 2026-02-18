import { type PieChartConvertibleFields } from '@/command-menu/pages/page-layout/types/PieChartConvertibleFields';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated-metadata/graphql';

export const convertBarOrLineChartConfigToPieChart = (
  configuration: BarChartConfiguration | LineChartConfiguration,
): PieChartConvertibleFields => {
  if (
    configuration.__typename !== 'BarChartConfiguration' &&
    configuration.__typename !== 'LineChartConfiguration'
  ) {
    return {};
  }

  return {
    groupByFieldMetadataId: configuration.primaryAxisGroupByFieldMetadataId,
    groupBySubFieldName: configuration.primaryAxisGroupBySubFieldName,
    dateGranularity: configuration.primaryAxisDateGranularity,
    orderBy: configuration.primaryAxisOrderBy,
    splitMultiValueFields: configuration.splitMultiValueFields,
  };
};
