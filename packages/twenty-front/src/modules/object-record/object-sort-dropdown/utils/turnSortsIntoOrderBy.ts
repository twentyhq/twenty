import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { hasPositionField } from '@/object-metadata/utils/hasPositionField';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getOrderByForFieldMetadataType } from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { OrderBy } from '@/types/OrderBy';
import { Sort } from '../types/Sort';

export const turnSortsIntoOrderBy = (
  objectMetadataItem: ObjectMetadataItem,
  sorts: Sort[],
): RecordGqlOperationOrderBy => {
  const fields: Pick<FieldMetadataItem, 'id' | 'name' | 'type'>[] =
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
    const positionOrderBy = [
      {
        position: 'AscNullsFirst',
      },
    ] satisfies RecordGqlOperationOrderBy;

    return [...sortsOrderBy, ...positionOrderBy].flat();
  }

  return sortsOrderBy.flat();
};
