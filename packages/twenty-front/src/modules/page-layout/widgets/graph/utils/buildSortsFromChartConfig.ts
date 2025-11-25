import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
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

  // Handle primaryAxisOrderBy for Bar and Line charts
  if (
    'primaryAxisOrderBy' in configuration &&
    (configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_ASC ||
      configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC)
  ) {
    const primaryField = objectMetadataItem.fields.find(
      (field) => field.id === configuration.primaryAxisGroupByFieldMetadataId,
    );

    if (isDefined(primaryField)) {
      sorts.push({
        fieldName: primaryField.name,
        direction:
          configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_ASC
            ? 'ASC'
            : 'DESC',
      });
    }
  }

  if (
    'primaryAxisOrderBy' in configuration &&
    (configuration.primaryAxisOrderBy === GraphOrderBy.VALUE_ASC ||
      configuration.primaryAxisOrderBy === GraphOrderBy.VALUE_DESC)
  ) {
    const aggregateField = objectMetadataItem.fields.find(
      (field) => field.id === configuration.aggregateFieldMetadataId,
    );

    if (isDefined(aggregateField)) {
      sorts.push({
        fieldName: aggregateField.name,
        direction:
          configuration.primaryAxisOrderBy === GraphOrderBy.VALUE_ASC
            ? 'ASC'
            : 'DESC',
      });
    }
  }

  // Handle orderBy for Pie charts (they have a different structure)
  if (
    'orderBy' in configuration &&
    (configuration.orderBy === GraphOrderBy.FIELD_ASC ||
      configuration.orderBy === GraphOrderBy.FIELD_DESC)
  ) {
    const groupByField = objectMetadataItem.fields.find(
      (field) => field.id === configuration.groupByFieldMetadataId,
    );

    if (isDefined(groupByField)) {
      sorts.push({
        fieldName: groupByField.name,
        direction:
          configuration.orderBy === GraphOrderBy.FIELD_ASC ? 'ASC' : 'DESC',
      });
    }
  }

  if (
    'orderBy' in configuration &&
    (configuration.orderBy === GraphOrderBy.VALUE_ASC ||
      configuration.orderBy === GraphOrderBy.VALUE_DESC)
  ) {
    const aggregateField = objectMetadataItem.fields.find(
      (field) => field.id === configuration.aggregateFieldMetadataId,
    );

    if (isDefined(aggregateField)) {
      sorts.push({
        fieldName: aggregateField.name,
        direction:
          configuration.orderBy === GraphOrderBy.VALUE_ASC ? 'ASC' : 'DESC',
      });
    }
  }

  return sorts;
};
