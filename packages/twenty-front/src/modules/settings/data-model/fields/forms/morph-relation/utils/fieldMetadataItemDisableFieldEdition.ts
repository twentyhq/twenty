import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const fieldMetadataItemDisableFieldEdition = (
  fieldMetadataItem: Pick<FieldMetadataItem, 'morphRelations'>,
) => {
  const morphRelations = fieldMetadataItem?.morphRelations;

  // TODO: @guillim to be updated with isCustom when available
  return isDefined(morphRelations) && morphRelations.length > 0
    ? morphRelations.every(
        (morphRelation) => !morphRelation.targetFieldMetadata.isCustom,
      )
    : false;
};
