import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { hasPositionField } from '@/object-metadata/utils/hasPositionField';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { Field, FieldMetadataType } from '~/generated/graphql';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { Sort } from '../types/Sort';

export const turnSortsIntoOrderBy = (
  objectMetadataItem: ObjectMetadataItem,
  sorts: Sort[],
): RecordGqlOperationOrderBy => {
  const fields: Pick<Field, 'id' | 'name' | 'type'>[] =
    objectMetadataItem?.fields ?? [];
  const fieldsById = mapArrayToObject(fields, ({ id }) => id);
  const sortsOrderBy = sorts
    .map((sort) => {
      const correspondingField = fieldsById[sort.fieldMetadataId];

      if (isUndefinedOrNull(correspondingField)) {
        return undefined;
      }

      const direction: OrderBy =
        sort.direction === 'asc' ? 'AscNullsFirst' : 'DescNullsLast';

      return getOrderByForFieldMetadataType(correspondingField, direction);
    })
    .filter(isDefined);

  if (hasPositionField(objectMetadataItem)) {
    return [...sortsOrderBy, { position: 'AscNullsFirst' }];
  }

  return sortsOrderBy;
};

const getOrderByForFieldMetadataType = (
  field: Pick<Field, 'id' | 'name' | 'type'>,
  direction: OrderBy,
) => {
  switch (field.type) {
    case FieldMetadataType.FullName:
      return {
        [field.name]: {
          firstName: direction,
          lastName: direction,
        },
      };

    default:
      return { [field.name]: direction };
  }
};
