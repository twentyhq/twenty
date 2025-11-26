import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { buildSortsForChartFieldOrderBy } from '@/page-layout/widgets/graph/utils/buildSortsForChartFieldOrderBy';
import { buildSortsForChartValueOrderBy } from '@/page-layout/widgets/graph/utils/buildSortsForChartValueOrderBy';
import { normalizeChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { isDefined } from 'twenty-shared/utils';
import {
  type BarChartConfiguration,
  type LineChartConfiguration,
  type PieChartConfiguration,
} from '~/generated/graphql';

type ChartSort = {
  fieldName: string;
  direction: 'ASC' | 'DESC';
};

type BuildSortsFromChartConfigParams = {
  configuration:
    | BarChartConfiguration
    | LineChartConfiguration
    | PieChartConfiguration;
  objectMetadataItem: ObjectMetadataItem;
};

export const buildSortsFromChartConfig = ({
  configuration,
  objectMetadataItem,
}: BuildSortsFromChartConfigParams): ChartSort[] => {
  const normalizedFields = normalizeChartConfigurationFields(configuration);

  const fieldSort = buildSortsForChartFieldOrderBy({
    normalizedFields,
    objectMetadataItem,
  });

  if (isDefined(fieldSort)) {
    return [fieldSort];
  }

  const valueSort = buildSortsForChartValueOrderBy({
    normalizedFields,
    aggregateFieldMetadataId: configuration.aggregateFieldMetadataId,
    objectMetadataItem,
  });

  if (isDefined(valueSort)) {
    return [valueSort];
  }

  return [];
};
