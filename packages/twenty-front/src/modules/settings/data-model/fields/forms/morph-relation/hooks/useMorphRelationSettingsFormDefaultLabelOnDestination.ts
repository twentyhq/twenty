import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { fieldMetadataItemHasMorphRelations } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemHasMorphRelations.util';
import { RelationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useMorphRelationSettingsFormDefaultLabelOnDestination = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationType,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'morphRelations'>;
  objectMetadataItem?: Pick<
    ObjectMetadataItem,
    'id' | 'namePlural' | 'nameSingular'
  >;
  relationType: RelationType;
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
      return targetFieldMetadata?.label ?? '';
    }
  }

  if (isDefined(objectMetadataItem)) {
    return [RelationType.MANY_TO_ONE].includes(relationType)
      ? objectMetadataItem.namePlural
      : objectMetadataItem.nameSingular;
  }

  return '';
};
