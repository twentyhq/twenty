import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

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
  objectMetadataItem: EnrichedObjectMetadataItem,
  sorts: RecordSort[],
  objectMetadataItems: EnrichedObjectMetadataItem[] = [],
): RecordGqlOperationOrderBy => {
  const fields = objectMetadataItem?.fields ?? [];

  const fieldsById = mapArrayToObject(fields, ({ id }) => id);

  const sortsOrderBy = sorts
    .map((sort) => {
      const correspondingField = fieldsById[sort.fieldMetadataId];

      if (isUndefinedOrNull(correspondingField)) {
        return undefined;
      }

      // Empty values stay at the bottom in both directions: sorting is about
      // seeing values, so a sparsely-filled column must not start with a wall
      // of empty rows when sorted ascending
      const direction: OrderBy =
        sort.direction === ViewSortDirection.ASC
          ? 'AscNullsLast'
          : 'DescNullsLast';

      if (correspondingField.type === FieldMetadataType.RELATION) {
        const relatedObjectName =
          correspondingField.relation?.targetObjectMetadata?.nameSingular;
        const relatedObjectMetadata = objectMetadataItems.find(
          (item) => item.nameSingular === relatedObjectName,
        );

        if (isDefined(relatedObjectMetadata)) {
          return getOrderByForRelationField({
            field: correspondingField,
            relatedObjectMetadataItem: relatedObjectMetadata,
            orderByDirection: direction,
          });
        }
        // Fallback if related object not found - sort by FK
        return [{ [`${correspondingField.name}Id`]: direction }];
      }

      return getOrderByForFieldMetadataType({
        field: correspondingField,
        orderByDirection: direction,
        primaryCompositeSubField: sort.subFieldName,
      });
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
