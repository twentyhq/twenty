import { FieldMetadataType } from 'twenty-shared/types';
import { GraphOrderBy } from '~/generated/graphql';

export const getChartDefaultOrderByForFieldType = (
  fieldType: FieldMetadataType,
): GraphOrderBy => {
  const isSelectField = fieldType === FieldMetadataType.SELECT;

  return isSelectField
    ? GraphOrderBy.FIELD_POSITION_ASC
    : GraphOrderBy.FIELD_ASC;
};
