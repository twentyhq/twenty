import { type FieldMetadataType } from 'twenty-shared/types';
import { computeRelationFieldJoinColumnName } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const extractGraphQLRelationFieldNames = (
  fieldMetadata: FlatFieldMetadata<
    FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION
  >,
) => {
  const fieldMetadataName = fieldMetadata.name;
  const joinColumnName = computeRelationFieldJoinColumnName({
    name: fieldMetadataName,
  });

  return { joinColumnName, fieldMetadataName };
};
