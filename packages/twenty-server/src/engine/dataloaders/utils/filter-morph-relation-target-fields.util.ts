import { FieldMetadataType } from 'twenty-shared/types';
import { isMorphRelationGroup } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const filterMorphRelationTargetFields = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatFieldMetadata[] =>
  flatFieldMetadatas.filter(
    (fieldMetadata) =>
      fieldMetadata.type !== FieldMetadataType.MORPH_RELATION ||
      isMorphRelationGroup(fieldMetadata),
  );
