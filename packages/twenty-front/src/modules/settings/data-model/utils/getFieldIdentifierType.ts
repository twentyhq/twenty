import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';
import { type FieldIdentifierType } from '@/settings/data-model/types/FieldIdentifierType';

export const getFieldIdentifierType = (
  activeFieldMetadatItem: FieldMetadataItem,
  activeObjectMetadataItem: EnrichedObjectMetadataItem,
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
