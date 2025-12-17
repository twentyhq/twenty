import { isBarOrLineChartConfiguration } from '@/command-menu/pages/page-layout/utils/isBarOrLineChartConfiguration';
import { isPieChartConfiguration } from '@/command-menu/pages/page-layout/utils/isPieChartConfiguration';
import {
    type BarChartConfiguration,
    type GraphOrderBy,
    type LineChartConfiguration,
    type ObjectRecordGroupByDateGranularity,
    type PieChartConfiguration,
} from '~/generated-metadata/graphql';

export type NormalizedChartConfigurationFields = {
  groupByFieldMetadataId?: string;
  groupBySubFieldName?: string | null;
  dateGranularity?: ObjectRecordGroupByDateGranularity | null;
  orderBy?: GraphOrderBy | null;
};

export const normalizeChartConfigurationFields = (
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration,
): NormalizedChartConfigurationFields => {
  if (isBarOrLineChartConfiguration(configuration)) {
    return {
      groupByFieldMetadataId: configuration.primaryAxisGroupByFieldMetadataId,
      groupBySubFieldName: configuration.primaryAxisGroupBySubFieldName,
      dateGranularity: configuration.primaryAxisDateGranularity,
      orderBy: configuration.primaryAxisOrderBy,
    };
  }

  if (isPieChartConfiguration(configuration)) {
    return {
      groupByFieldMetadataId: configuration.groupByFieldMetadataId,
      groupBySubFieldName: configuration.groupBySubFieldName,
      dateGranularity: configuration.dateGranularity,
      orderBy: configuration.orderBy,
    };
  }

  return {};
};
