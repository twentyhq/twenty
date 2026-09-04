import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type RecordShareStandardUniversalIdentifiers } from 'src/database/commands/upgrade-version-command/2-39/types/record-share-standard-universal-identifiers.type';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';

const RECORD_SHARE_OBJECT_UNIVERSAL_IDENTIFIER =
  STANDARD_OBJECTS.recordShare.universalIdentifier;

export const collectRecordShareStandardUniversalIdentifiers = ({
  standardAllFlatEntityMaps,
}: {
  standardAllFlatEntityMaps: TwentyStandardAllFlatEntityMaps;
}): RecordShareStandardUniversalIdentifiers => {
  const fieldMetadata = Object.values(
    standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatFieldMetadata) =>
        flatFieldMetadata.objectMetadataUniversalIdentifier ===
        RECORD_SHARE_OBJECT_UNIVERSAL_IDENTIFIER,
    )
    .map((flatFieldMetadata) => flatFieldMetadata.universalIdentifier);

  const index = Object.values(
    standardAllFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatIndexMetadata) =>
        flatIndexMetadata.objectMetadataUniversalIdentifier ===
        RECORD_SHARE_OBJECT_UNIVERSAL_IDENTIFIER,
    )
    .map((flatIndexMetadata) => flatIndexMetadata.universalIdentifier);

  return {
    objectMetadata: [RECORD_SHARE_OBJECT_UNIVERSAL_IDENTIFIER],
    fieldMetadata,
    index,
  };
};
