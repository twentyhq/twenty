import { FieldMetadataType } from 'twenty-shared/types';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export const extractGraphQLRelationFieldNames = (
  fieldMetadata: FieldMetadataEntity<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
) => {
  const joinColumnName = fieldMetadata.settings?.joinColumnName;

  if (!joinColumnName) {
    throw new Error('Join column name is not defined');
  }

  const fieldMetadataName = fieldMetadata.name;

  return { joinColumnName, fieldMetadataName };
};
