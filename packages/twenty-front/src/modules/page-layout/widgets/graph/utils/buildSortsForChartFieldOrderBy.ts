import { findChartGroupByFieldMetadataItem } from '@/page-layout/widgets/graph/utils/findChartGroupByFieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type NormalizedChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated-metadata/graphql';

type ChartSort = {
  fieldName: string;
  direction: 'ASC' | 'DESC';
};

type BuildSortsForChartFieldOrderByParams = {
  normalizedFields: NormalizedChartConfigurationFields;
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const buildSortsForChartFieldOrderBy = ({
  normalizedFields,
  objectMetadataItem,
}: BuildSortsForChartFieldOrderByParams): ChartSort | null => {
  const { groupByFieldMetadataId, groupBySubFieldName, orderBy } =
    normalizedFields;

  if (
    (orderBy !== GraphOrderBy.FIELD_ASC &&
      orderBy !== GraphOrderBy.FIELD_DESC) ||
    !isDefined(groupByFieldMetadataId)
  ) {
    return null;
  }

  const primaryField = findChartGroupByFieldMetadataItem({
    fieldMetadataItems: objectMetadataItem.fields,
    groupByFieldMetadataId,
  });

  if (!isDefined(primaryField)) {
    return null;
  }

  const fieldName = isNonEmptyString(groupBySubFieldName)
    ? `${primaryField.name}.${groupBySubFieldName}`
    : primaryField.name;

  return {
    fieldName,
    direction: orderBy === GraphOrderBy.FIELD_ASC ? 'ASC' : 'DESC',
  };
};
