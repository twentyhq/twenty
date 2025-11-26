import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { normalizeChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import {
  GraphOrderBy,
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
  const sorts: ChartSort[] = [];
  const { groupByFieldMetadataId, groupBySubFieldName, orderBy } =
    normalizeChartConfigurationFields(configuration);

  if (
    orderBy === GraphOrderBy.FIELD_ASC ||
    orderBy === GraphOrderBy.FIELD_DESC
  ) {
    const primaryField = groupByFieldMetadataId
      ? objectMetadataItem.fields.find(
          (field) => field.id === groupByFieldMetadataId,
        )
      : undefined;

    if (isDefined(primaryField)) {
      const fieldName = isNonEmptyString(groupBySubFieldName)
        ? `${primaryField.name}.${groupBySubFieldName}`
        : primaryField.name;

      sorts.push({
        fieldName,
        direction: orderBy === GraphOrderBy.FIELD_ASC ? 'ASC' : 'DESC',
      });
    }
  }

  if (
    orderBy === GraphOrderBy.VALUE_ASC ||
    orderBy === GraphOrderBy.VALUE_DESC
  ) {
    const aggregateField = objectMetadataItem.fields.find(
      (field) => field.id === configuration.aggregateFieldMetadataId,
    );

    if (isDefined(aggregateField)) {
      sorts.push({
        fieldName: aggregateField.name,
        direction: orderBy === GraphOrderBy.VALUE_ASC ? 'ASC' : 'DESC',
      });
    }
  }

  return sorts;
};
