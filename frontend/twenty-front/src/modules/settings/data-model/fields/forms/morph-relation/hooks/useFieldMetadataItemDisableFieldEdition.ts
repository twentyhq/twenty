import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldRelation } from '@/object-record/record-field/ui/types/guards/isFieldRelation';
import { isDefined } from 'twenty-shared/utils';

export const useFieldMetadataItemDisableFieldEdition = (
  fieldMetadataItem:
    | Pick<FieldMetadataItem, 'morphRelations' | 'type' | 'id'>
    | undefined,
) => {
  const { fieldMetadataItem: fieldMetadataItemWithIsCustom } =
    useFieldMetadataItemById(fieldMetadataItem?.id ?? '');

  if (!isDefined(fieldMetadataItem)) {
    return false;
  }

  const morphRelations = fieldMetadataItem?.morphRelations;

  if (isFieldRelation(fieldMetadataItem)) {
    return (
      isDefined(fieldMetadataItemWithIsCustom) &&
      fieldMetadataItemWithIsCustom?.isCustom === true
    );
  }

  return isDefined(morphRelations) && morphRelations.length > 0
    ? morphRelations.every(
        (morphRelation) => !morphRelation.targetFieldMetadata.isCustom,
      )
    : false;
};
