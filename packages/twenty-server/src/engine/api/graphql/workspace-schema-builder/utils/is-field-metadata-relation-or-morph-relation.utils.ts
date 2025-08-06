import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

export const isFieldMetadataRelationOrMorphRelation = (
  fieldMetadata: FieldMetadataEntity<FieldMetadataType>,
): fieldMetadata is FieldMetadataEntity &
  (
    | FieldMetadataEntity<FieldMetadataType.RELATION>
    | FieldMetadataEntity<FieldMetadataType.MORPH_RELATION>
  ) => {
  return (
    isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION) ||
    isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.MORPH_RELATION)
  );
};
