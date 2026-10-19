import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { fieldMetadataItemHasMorphRelations } from '@/settings/data-model/fields/forms/morph-relation/utils/fieldMetadataItemHasMorphRelations';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import {
  capitalize,
  getFieldIconOrTypeDefault,
  isDefined,
} from 'twenty-shared/utils';

export const useRelationSettingsFormDefaultValuesTargetFieldMetadata = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationType,
}: {
  fieldMetadataItem?: Pick<
    FieldMetadataItem,
    'type' | 'morphRelations' | 'relation'
  >;
  objectMetadataItem?: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'namePlural' | 'nameSingular' | 'icon'
  >;
  relationType: RelationType;
}): {
  icon: string;
  label: string;
} => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();

  if (!isDefined(fieldMetadataItem)) {
    return {
      icon: getFieldIconOrTypeDefault({ type: FieldMetadataType.RELATION }),
      label: '',
    };
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION &&
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
        icon: getFieldIconOrTypeDefault({
          icon: targetFieldMetadata?.icon,
          type: FieldMetadataType.RELATION,
        }),
        label: capitalize(targetFieldMetadata?.label ?? ''),
      };
    }
  }

  if (
    fieldMetadataItem.type === FieldMetadataType.RELATION &&
    isDefined(fieldMetadataItem.relation?.targetObjectMetadata.id)
  ) {
    const { fieldMetadataItem: targetFieldMetadata } = getFieldMetadataItemById(
      {
        fieldMetadataId: fieldMetadataItem.relation?.targetFieldMetadata.id,
        objectMetadataItems: activeObjectMetadataItems,
      },
    );
    return {
      icon: getFieldIconOrTypeDefault({
        icon: targetFieldMetadata?.icon,
        type: FieldMetadataType.RELATION,
      }),
      label: capitalize(
        fieldMetadataItem.relation?.targetFieldMetadata?.name ?? '',
      ),
    };
  }

  if (isDefined(objectMetadataItem)) {
    const label = [RelationType.MANY_TO_ONE].includes(relationType)
      ? objectMetadataItem.namePlural
      : objectMetadataItem.nameSingular;

    return {
      icon: getFieldIconOrTypeDefault({
        icon: objectMetadataItem.icon,
        type: FieldMetadataType.RELATION,
      }),
      label: capitalize(label),
    };
  }

  return {
    icon: getFieldIconOrTypeDefault({ type: FieldMetadataType.RELATION }),
    label: '',
  };
};
