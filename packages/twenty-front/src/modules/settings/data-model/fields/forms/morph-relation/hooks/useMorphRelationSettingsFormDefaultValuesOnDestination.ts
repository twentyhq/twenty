import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { fieldMetadataItemHasMorphRelations } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemHasMorphRelations';
import { RelationType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const useMorphRelationSettingsFormDefaultValuesOnDestination = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationType,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'morphRelations'>;
  objectMetadataItem?: Pick<
    ObjectMetadataItem,
    'id' | 'namePlural' | 'nameSingular' | 'icon'
  >;
  relationType: RelationType;
}): {
  icon: string;
  label: string;
} => {
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

      return {
        icon: targetFieldMetadata?.icon ?? 'IconUsers',
        label: capitalize(targetFieldMetadata?.label ?? ''),
      };
    }
  }

  if (isDefined(objectMetadataItem)) {
    const label = [RelationType.MANY_TO_ONE].includes(relationType)
      ? objectMetadataItem.namePlural
      : objectMetadataItem.nameSingular;

    return {
      icon: objectMetadataItem.icon ?? 'IconUsers',
      label: capitalize(label),
    };
  }

  return {
    icon: 'IconUsers',
    label: '',
  };
};
