import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';
import {
  GraphOrderBy,
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';

type ChartSort = {
  fieldName: string;
  direction: 'ASC' | 'DESC';
};

type BuildSortsFromChartConfigParams = {
  configuration: BarChartConfiguration | LineChartConfiguration;
  objectMetadataItem: ObjectMetadataItem;
};

export const buildSortsFromChartConfig = ({
  configuration,
  objectMetadataItem,
}: BuildSortsFromChartConfigParams): ChartSort[] => {
  const sorts: ChartSort[] = [];

  if (
    configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_ASC ||
    configuration.primaryAxisOrderBy === GraphOrderBy.FIELD_DESC
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
    configuration.primaryAxisOrderBy === GraphOrderBy.VALUE_ASC ||
    configuration.primaryAxisOrderBy === GraphOrderBy.VALUE_DESC
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

  return sorts;
};
