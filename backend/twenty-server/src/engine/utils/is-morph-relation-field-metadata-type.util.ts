import { FieldMetadataType } from 'twenty-shared/types';

export const isMorphRelationFieldMetadataType = (
  type: FieldMetadataType,
): type is FieldMetadataType.MORPH_RELATION => {
  return type === FieldMetadataType.MORPH_RELATION;
};
