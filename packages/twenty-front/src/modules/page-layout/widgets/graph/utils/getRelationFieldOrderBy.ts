import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  type ObjectRecordOrderByForRelationField,
  type ObjectRecordOrderByForScalarField,
  type OrderByDirection,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getRelationFieldOrderBy = (
  groupByField: FieldMetadataItem,
  groupBySubFieldName: string | null | undefined,
  direction: OrderByDirection,
): ObjectRecordOrderByForScalarField | ObjectRecordOrderByForRelationField => {
  if (!isDefined(groupBySubFieldName)) {
    return {
      [`${groupByField.name}Id`]: direction,
    };
  }

  const [nestedFieldName, nestedSubFieldName] = groupBySubFieldName.split('.');

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
