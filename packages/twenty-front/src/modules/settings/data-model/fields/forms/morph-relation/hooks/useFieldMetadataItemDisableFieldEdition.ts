import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
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

  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();

  if (!isDefined(fieldMetadataItem)) {
    return false;
  }

  const morphRelations = fieldMetadataItem?.morphRelations;

  if (isFieldRelation(fieldMetadataItem)) {
    return (
      isDefined(fieldMetadataItemWithIsCustom) &&
      getIsMetadataItemCustom(fieldMetadataItemWithIsCustom)
    );
  }

  return isDefined(morphRelations) && morphRelations.length > 0;
};
