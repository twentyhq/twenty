import { ServiceUnavailableException } from '@nestjs/common';
import { FieldMetadataType } from 'twenty-shared/types';
import { isMorphRelationGroup } from 'twenty-shared/utils';

import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const filterMorphRelationTargetFields = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatFieldMetadata[] => {
  const groupIdentifiers = new Set(
    flatFieldMetadatas
      .filter(isMorphRelationGroup)
      .map((field) => `${field.objectMetadataId}:${field.universalIdentifier}`),
  );

  // Until the 2.46 backfill completes, returning partial metadata would erase saved fields on clients.
  if (
    flatFieldMetadatas.some(
      (field) =>
        field.type === FieldMetadataType.MORPH_RELATION &&
        !groupIdentifiers.has(`${field.objectMetadataId}:${field.morphId}`),
    )
  ) {
    throw new ServiceUnavailableException(
      'Workspace metadata upgrade is still pending. Please retry after the upgrade completes.',
    );
  }

  return flatFieldMetadatas.filter(
    (fieldMetadata) =>
      fieldMetadata.type !== FieldMetadataType.MORPH_RELATION ||
      isMorphRelationGroup(fieldMetadata),
  );
};
