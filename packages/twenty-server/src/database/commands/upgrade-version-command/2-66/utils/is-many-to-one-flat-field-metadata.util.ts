import { type FieldMetadataType, RelationType } from 'twenty-shared/types';

import { type MorphOrRelationFieldMetadataType } from 'src/engine/metadata-modules/field-metadata/types/morph-or-relation-field-metadata-type.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';

export const isManyToOneFlatFieldMetadata = (
  flatFieldMetadata: FlatFieldMetadata<FieldMetadataType>,
): flatFieldMetadata is FlatFieldMetadata<MorphOrRelationFieldMetadataType> =>
  isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
  flatFieldMetadata.universalSettings.relationType === RelationType.MANY_TO_ONE;
