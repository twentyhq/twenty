import { FieldMetadataType } from 'twenty-shared/types';
import {
  hasInverseRelationField,
  isComputedField,
  isDefined,
} from 'twenty-shared/utils';

import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type ExportableRelationFlatFieldMetadata = UniversalFlatFieldMetadata & {
  relationTargetObjectMetadataUniversalIdentifier: string;
  universalSettings: NonNullable<
    UniversalFlatFieldMetadata['universalSettings']
  >;
};

export const getUnsupportedRelationFieldReason = (
  flatFieldMetadata: UniversalFlatFieldMetadata,
): string | undefined => {
  if (!isMorphOrRelationFieldMetadataType(flatFieldMetadata.type)) {
    return undefined;
  }

  // Only a computed relation reads through the inverse field of another relation
  const isMissingInverseField =
    !hasInverseRelationField(flatFieldMetadata) &&
    !isComputedField(flatFieldMetadata);

  if (
    isMissingInverseField ||
    !isDefined(
      flatFieldMetadata.relationTargetObjectMetadataUniversalIdentifier,
    ) ||
    !isDefined(flatFieldMetadata.universalSettings)
  ) {
    return 'relation field without target or settings';
  }

  if (
    flatFieldMetadata.type === FieldMetadataType.MORPH_RELATION &&
    !isDefined(flatFieldMetadata.morphId)
  ) {
    return 'morph relation field without morphId';
  }

  return undefined;
};

export const isExportableRelationFlatFieldMetadata = (
  flatFieldMetadata: UniversalFlatFieldMetadata,
): flatFieldMetadata is ExportableRelationFlatFieldMetadata =>
  isMorphOrRelationFieldMetadataType(flatFieldMetadata.type) &&
  !isDefined(getUnsupportedRelationFieldReason(flatFieldMetadata));
