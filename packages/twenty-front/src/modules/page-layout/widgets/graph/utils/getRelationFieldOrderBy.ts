import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { GRAPH_DEFAULT_DATE_GRANULARITY } from '@/page-layout/widgets/graph/constants/GraphDefaultDateGranularity';
import {
  type ObjectRecordGroupByDateGranularity,
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type OrderByDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRelationFieldOrderBy = (
  groupByField: FieldMetadataItem,
  groupBySubFieldName: string | null | undefined,
  direction: OrderByDirection,
  dateGranularity?: ObjectRecordGroupByDateGranularity,
  isNestedDateField?: boolean,
): ObjectRecordOrderByForScalarField | ObjectRecordOrderByForRelationField => {
  if (!isDefined(groupBySubFieldName)) {
    return {
      [`${groupByField.name}Id`]: direction,
    };
  }

  const [nestedFieldName, nestedSubFieldName] = groupBySubFieldName.split('.');

  if (isNestedDateField === true || isDefined(dateGranularity)) {
    return {
      [groupByField.name]: {
        [nestedFieldName]: {
          orderBy: direction,
          granularity: dateGranularity ?? GRAPH_DEFAULT_DATE_GRANULARITY,
        },
      },
    };
  }

  if (!isDefined(nestedSubFieldName)) {
    return {
      [groupByField.name]: {
        [nestedFieldName]: direction,
      },
    };
  }

  return {
    [groupByField.name]: {
      [nestedFieldName]: {
        [nestedSubFieldName]: direction,
      },
    },
  };
};
