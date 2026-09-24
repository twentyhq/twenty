import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isMorphOrRelationFieldMetadataType } from 'src/engine/utils/is-morph-or-relation-field-metadata-type.util';
import { type UniversalFlatFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-field-metadata.type';

export type ExportableRelationFlatFieldMetadata = UniversalFlatFieldMetadata & {
  relationTargetFieldMetadataUniversalIdentifier: string;
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

  if (
    !isDefined(
      flatFieldMetadata.relationTargetFieldMetadataUniversalIdentifier,
    ) ||
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
