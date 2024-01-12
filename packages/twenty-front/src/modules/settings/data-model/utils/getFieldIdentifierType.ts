import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { FieldIdentifierType } from '@/settings/data-model/types/FieldIdentifierType';

export const getFieldIdentifierType = (
  activeFieldMetadatItem: FieldMetadataItem,
  activeObjectMetadataItem: ObjectMetadataItem,
): FieldIdentifierType | undefined => {
  const fieldIsLabelIdentifier = isLabelIdentifierField({
    fieldMetadataItem: activeFieldMetadatItem,
    objectMetadataItem: activeObjectMetadataItem,
  });

  if (fieldIsLabelIdentifier) {
    return 'label';
  }

  const fieldIsImageIdentifier =
    activeObjectMetadataItem.imageIdentifierFieldMetadataId ===
    activeFieldMetadatItem.id;

  if (fieldIsImageIdentifier) {
    return 'image';
  }

  return undefined;
};
