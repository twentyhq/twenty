import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

// Morph parents are declared per target, so an unknown declaration matches a lone morph field
export const isDeclaredParentField = ({
  objectMetadataItem,
  fieldMetadataItem,
}: {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
}) => {
  if (objectMetadataItem.readability !== MetadataReadability.INHERITED) {
    return false;
  }

  const declaredUniversalIdentifiers =
    objectMetadataItem.readabilityParentFieldUniversalIdentifiers ?? [];

  if (
    declaredUniversalIdentifiers.includes(fieldMetadataItem.universalIdentifier)
  ) {
    return true;
  }

  if (fieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
    return false;
  }

  const morphFieldMetadataItems = objectMetadataItem.fields.filter(
    (field) => field.type === FieldMetadataType.MORPH_RELATION,
  );

  const hasUnmatchedDeclaration = declaredUniversalIdentifiers.some(
    (universalIdentifier) =>
      !objectMetadataItem.fields.some(
        (field) => field.universalIdentifier === universalIdentifier,
      ),
  );

  return morphFieldMetadataItems.length === 1 && hasUnmatchedDeclaration;
};
