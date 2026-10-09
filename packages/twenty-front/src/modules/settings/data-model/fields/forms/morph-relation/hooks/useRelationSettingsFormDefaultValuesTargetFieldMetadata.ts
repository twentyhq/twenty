import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldMetadataItemById } from '@/object-metadata/utils/getFieldMetadataItemById';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { capitalize, isDefined } from 'twenty-shared/utils';

export const useRelationSettingsFormDefaultValuesTargetFieldMetadata = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationType,
}: {
  fieldMetadataItem?: Pick<FieldMetadataItem, 'type' | 'relation' | 'settings'>;
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
      icon: 'IconUsers',
      label: '',
    };
  }

  if (fieldMetadataItem.type === FieldMetadataType.MORPH_RELATION) {
    return {
      icon:
        fieldMetadataItem.settings?.targetFieldIcon ??
        objectMetadataItem?.icon ??
        'IconUsers',
      label: capitalize(fieldMetadataItem.settings?.targetFieldLabel ?? ''),
    };
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
      icon: targetFieldMetadata?.icon ?? 'IconUsers',
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
      icon: objectMetadataItem.icon ?? 'IconUsers',
      label: capitalize(label),
    };
  }

  return {
    icon: 'IconUsers',
    label: '',
  };
};
