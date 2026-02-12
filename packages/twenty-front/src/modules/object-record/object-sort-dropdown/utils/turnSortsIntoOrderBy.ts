import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

import {
  type OrderBy,
  type RecordGqlOperationOrderBy,
} from 'twenty-shared/types';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import {
  getOrderByForFieldMetadataType,
  getOrderByForRelationField,
} from '@/object-metadata/utils/getOrderByForFieldMetadataType';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { isDefined } from 'twenty-shared/utils';
import {
  FieldMetadataType,
  ViewSortDirection,
} from '~/generated-metadata/graphql';

export const turnSortsIntoOrderBy = (
  objectMetadataItem: ObjectMetadataItem,
  sorts: RecordSort[],
  objectMetadataItems: ObjectMetadataItem[] = [],
): RecordGqlOperationOrderBy => {
  const fields = objectMetadataItem?.fields ?? [];

  const fieldsById = mapArrayToObject(fields, ({ id }) => id);

  const sortsOrderBy = sorts
    .map((sort) => {
      const correspondingField = fieldsById[sort.fieldMetadataId];

      if (isUndefinedOrNull(correspondingField)) {
        return undefined;
      }

      const direction: OrderBy =
        sort.direction === ViewSortDirection.ASC
          ? 'AscNullsFirst'
          : 'DescNullsLast';

      // Handle RELATION fields by looking up related object metadata
      if (correspondingField.type === FieldMetadataType.RELATION) {
        const relatedObjectName =
          correspondingField.relation?.targetObjectMetadata?.nameSingular;
        const relatedObjectMetadata = objectMetadataItems.find(
          (item) => item.nameSingular === relatedObjectName,
        );

        if (isDefined(relatedObjectMetadata)) {
          return getOrderByForRelationField(
            correspondingField,
            relatedObjectMetadata,
            direction,
          );
        }
        // Fallback if related object not found - sort by FK
        return [{ [`${correspondingField.name}Id`]: direction }];
      }

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
