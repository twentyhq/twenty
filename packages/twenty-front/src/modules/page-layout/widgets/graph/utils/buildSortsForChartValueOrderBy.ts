import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type NormalizedChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type ChartSort = {
  fieldName: string;
  direction: 'ASC' | 'DESC';
};

type BuildSortsForChartValueOrderByParams = {
  normalizedFields: NormalizedChartConfigurationFields;
  aggregateFieldMetadataId: string;
  objectMetadataItem: ObjectMetadataItem;
};

export const buildSortsForChartValueOrderBy = ({
  normalizedFields,
  aggregateFieldMetadataId,
  objectMetadataItem,
}: BuildSortsForChartValueOrderByParams): ChartSort | null => {
  const { orderBy } = normalizedFields;

  if (
    orderBy !== GraphOrderBy.VALUE_ASC &&
    orderBy !== GraphOrderBy.VALUE_DESC
  ) {
    return null;
  }

  const aggregateField = objectMetadataItem.fields.find(
    (field) => field.id === aggregateFieldMetadataId,
  );

  if (!isDefined(aggregateField)) {
    return null;
  }

  return {
    fieldName: aggregateField.name,
    direction: orderBy === GraphOrderBy.VALUE_ASC ? 'ASC' : 'DESC',
  };
};
