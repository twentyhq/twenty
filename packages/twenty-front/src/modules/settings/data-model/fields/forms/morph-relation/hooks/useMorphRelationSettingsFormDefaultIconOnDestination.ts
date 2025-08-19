import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { fieldMetadataItemHasMorphRelations } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemHasMorphRelations.util';
import { isDefined } from 'twenty-shared/utils';

export const useMorphRelationSettingsFormDefaultIconOnDestination = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'morphRelations'>;
  objectMetadataItem?: Pick<ObjectMetadataItem, 'id' | 'icon'>;
}): string => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  if (
    isDefined(fieldMetadataItem) &&
    fieldMetadataItemHasMorphRelations(fieldMetadataItem)
  ) {
    const firstMorphRelation = fieldMetadataItem.morphRelations?.[0];

    if (isDefined(firstMorphRelation)) {
      const targetObjectMetadata = activeObjectMetadataItems.find(
        (item) => item.id === firstMorphRelation.targetObjectMetadata.id,
      );
      const targetFieldMetadata = targetObjectMetadata?.fields.find(
        (field) => field.id === firstMorphRelation.targetFieldMetadata.id,
      );
      return targetFieldMetadata?.icon ?? 'IconUsers';
    }

    return 'IconUsers';
  }

  if (isDefined(objectMetadataItem)) {
    return objectMetadataItem.icon ?? 'IconUsers';
  }

  return 'IconUsers';
};
