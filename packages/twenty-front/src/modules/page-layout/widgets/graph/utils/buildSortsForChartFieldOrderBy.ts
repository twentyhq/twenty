import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type NormalizedChartConfigurationFields } from '@/page-layout/widgets/graph/utils/normalizeChartConfigurationFields';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { GraphOrderBy } from '~/generated/graphql';

type ChartSort = {
  fieldName: string;
  direction: 'ASC' | 'DESC';
};

type BuildSortsForChartFieldOrderByParams = {
  normalizedFields: NormalizedChartConfigurationFields;
  objectMetadataItem: ObjectMetadataItem;
};

export const buildSortsForChartFieldOrderBy = ({
  normalizedFields,
  objectMetadataItem,
}: BuildSortsForChartFieldOrderByParams): ChartSort | null => {
  const { groupByFieldMetadataId, groupBySubFieldName, orderBy } =
    normalizedFields;

  if (
    orderBy !== GraphOrderBy.FIELD_ASC &&
    orderBy !== GraphOrderBy.FIELD_DESC
  ) {
    return null;
  }

  const primaryField = groupByFieldMetadataId
    ? objectMetadataItem.fields.find(
        (field) => field.id === groupByFieldMetadataId,
      )
    : undefined;

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
