import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getOrderByForFieldMetadataType } from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { OrderBy } from '@/types/OrderBy';
import { isDefined } from 'twenty-shared/utils';

export const turnSortsIntoOrderBy = (
  objectMetadataItem: ObjectMetadataItem,
  sorts: RecordSort[],
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

  if (
    !objectMetadataItem.isRemote &&
    hasObjectMetadataItemPositionField(objectMetadataItem)
  ) {
    const positionOrderBy = [
      {
        position: 'AscNullsFirst',
      },
    ] satisfies RecordGqlOperationOrderBy;

    return [...sortsOrderBy, ...positionOrderBy].flat();
  }

  return sortsOrderBy.flat();
};
