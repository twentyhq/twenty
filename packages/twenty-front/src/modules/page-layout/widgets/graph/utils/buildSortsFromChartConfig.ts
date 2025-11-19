import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  GraphOrderBy,
  type BarChartConfiguration,
  type LineChartConfiguration,
} from '~/generated/graphql';
import { isDefined } from 'twenty-shared/utils';

type ChartSort = {
  fieldName: string;
  direction: 'ASC' | 'DESC';
};

type BuildSortsFromChartConfigParams = {
  configuration: BarChartConfiguration | LineChartConfiguration;
  objectMetadataItem: ObjectMetadataItem;
};

/**
 * Extracts sorts from chart configuration.
 * Maps primary axis ordering and aggregate value ordering to sort parameters.
 */
export const buildSortsFromChartConfig = ({
  configuration,
  objectMetadataItem,
}: BuildSortsFromChartConfigParams): ChartSort[] => {
  const sorts: ChartSort[] = [];

  // Primary axis sort (if configured with FIELD_ASC/FIELD_DESC)
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

  // Aggregate field sort (for VALUE_ASC/VALUE_DESC ordering)
  // This helps show the most/least significant records first
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
