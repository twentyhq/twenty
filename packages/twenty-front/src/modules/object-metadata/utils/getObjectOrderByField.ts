import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { getLabelIdentifierFieldMetadataItem } from '@/object-metadata/utils/getLabelIdentifierFieldMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { isDefined } from '~/utils/isDefined';

export const getObjectOrderByField = (
  objectMetadataItem: ObjectMetadataItem,
  orderBy?: OrderBy | null,
): OrderByField => {
  const labelIdentifierFieldMetadata =
    getLabelIdentifierFieldMetadataItem(objectMetadataItem);

  if (isDefined(labelIdentifierFieldMetadata)) {
    switch (labelIdentifierFieldMetadata.type) {
      case FieldMetadataType.FullName:
        return {
          [labelIdentifierFieldMetadata.name]: {
            firstName: orderBy ?? 'AscNullsLast',
            lastName: orderBy ?? 'AscNullsLast',
          },
        };
      default:
        return {
          [labelIdentifierFieldMetadata.name]: orderBy ?? 'AscNullsLast',
        };
    }
  } else {
    return {
      createdAt: orderBy ?? 'DescNullsLast',
    };
  }
};
