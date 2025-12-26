import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isCompositeFieldType } from '@/object-record/object-filter-dropdown/utils/isCompositeFieldType';
import { isFieldMorphRelation } from '@/object-record/record-field/ui/types/guards/isFieldMorphRelation';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity';
import { getRelationFieldOrderBy } from '@/page-layout/widgets/graph/utils/getRelationFieldOrderBy';
import {
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForCompositeField,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type ObjectRecordOrderByWithGroupByDateField,
  type OrderByDirection,
} from 'twenty-shared/types';
import { isDefined, isFieldMetadataDateKind } from 'twenty-shared/utils';

export const getFieldOrderBy = (
  groupByField: FieldMetadataItem,
  groupBySubFieldName: string | null | undefined,
  dateGranularity: ObjectRecordGroupByDateGranularity | undefined,
  direction: OrderByDirection,
):
  | ObjectRecordOrderByForScalarField
  | ObjectRecordOrderByWithGroupByDateField
  | ObjectRecordOrderByForCompositeField
  | ObjectRecordOrderByForRelationField => {
  if (isCompositeFieldType(groupByField.type)) {
    if (!isDefined(groupBySubFieldName)) {
      throw new Error(
        `Group by subFieldName is required for composite fields (field: ${groupByField.name})`,
      );
    }
    return {
      [groupByField.name]: {
        [groupBySubFieldName]: direction,
      },
    };
  }

  if (isFieldMetadataDateKind(groupByField.type)) {
    return {
      [groupByField.name]: {
        orderBy: direction,
        granularity: dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY,
      },
    };
  }

  if (isFieldRelation(groupByField) || isFieldMorphRelation(groupByField)) {
    return getRelationFieldOrderBy(
      groupByField,
      groupBySubFieldName,
      direction,
      dateGranularity,
    );
  }

  return {
    [groupByField.name]: direction,
  };
};
