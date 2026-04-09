import { type FieldMetadataType } from 'twenty-shared/types';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const extractGraphQLRelationFieldNames = (
  fieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
) => {
  const settings = fieldMetadata.settings;
  const joinColumnName = settings?.joinColumnName;

  if (!joinColumnName) {
    throw new Error('Join column name is not defined');
  }

  const fieldMetadataName = fieldMetadata.name;

  return { joinColumnName, fieldMetadataName };
};
