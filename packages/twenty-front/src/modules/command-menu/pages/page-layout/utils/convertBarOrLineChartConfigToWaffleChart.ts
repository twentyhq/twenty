import { type WaffleChartConvertibleFields } from '@/command-menu/pages/page-layout/types/WaffleChartConvertibleFields';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

export const convertBarOrLineChartConfigToWaffleChart = (
  configuration: BarChartConfiguration | LineChartConfiguration,
): WaffleChartConvertibleFields => {
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
  };
};
