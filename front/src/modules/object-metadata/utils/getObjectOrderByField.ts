import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OrderBy } from '@/object-metadata/types/OrderBy';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const getObjectOrderByField = (
  objectMetadataItem: ObjectMetadataItem,
  orderBy: OrderBy,
): OrderByField => {
  const labelIdentifierFieldMetadata = objectMetadataItem.fields.find(
    (field) =>
      field.id === objectMetadataItem.labelIdentifierFieldMetadataId ||
      field.name === 'name',
  );

  if (labelIdentifierFieldMetadata) {
    switch (labelIdentifierFieldMetadata.type) {
      case FieldMetadataType.FullName:
        return {
          [labelIdentifierFieldMetadata.name]: {
            firstName: orderBy,
            lastName: orderBy,
          },
        };
      default:
        return {
          [labelIdentifierFieldMetadata.name]: orderBy,
        };
    }
  } else {
    return {
      createdAt: orderBy,
    };
  }
};
