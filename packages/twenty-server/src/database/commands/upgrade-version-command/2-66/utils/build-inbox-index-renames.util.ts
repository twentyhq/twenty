import { isDefined } from 'twenty-shared/utils';

import { INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-66/constants/inbox-object-names-by-universal-identifier.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { findFieldRelatedIndexes } from 'src/engine/metadata-modules/flat-field-metadata/utils/find-field-related-index.util';
import { recomputeIndexOnFlatFieldMetadataNameUpdate } from 'src/engine/metadata-modules/flat-field-metadata/utils/recompute-index-on-flat-field-metadata-name-update.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { recomputeIndexAfterFlatObjectMetadataSingularNameUpdate } from 'src/engine/metadata-modules/flat-object-metadata/utils/recompute-index-after-flat-object-metadata-singular-name-update.util';

export type InboxIndexRename = {
  indexMetadataId: string;
  fromName: string;
  toName: string;
};

export const buildInboxIndexRenames = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
  inboxRelationFlatFieldMetadataUpdates,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps: FlatEntityMaps<FlatIndexMetadata>;
  inboxRelationFlatFieldMetadataUpdates: FlatFieldMetadata[];
}): InboxIndexRename[] => {
  const renamedObjectFlatIndexes = Object.entries(
    INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER,
  ).flatMap(([universalIdentifier, inboxObjectNames]) => {
    const existingFlatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier];

    if (
      !isDefined(existingFlatObjectMetadata) ||
      !isDefined(inboxObjectNames)
    ) {
      return [];
    }

    return recomputeIndexAfterFlatObjectMetadataSingularNameUpdate({
      existingFlatObjectMetadata,
      updatedSingularName: inboxObjectNames.nameSingular,
      flatIndexMaps,
      flatFieldMetadataMaps,
    });
  });

  const renamedFieldFlatIndexes = inboxRelationFlatFieldMetadataUpdates.flatMap(
    (toFlatFieldMetadata) => {
      const fromFlatFieldMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatFieldMetadataMaps,
        flatEntityId: toFlatFieldMetadata.id,
      });
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityMaps: flatObjectMetadataMaps,
        flatEntityId: fromFlatFieldMetadata.objectMetadataId,
      });

      return recomputeIndexOnFlatFieldMetadataNameUpdate({
        flatObjectMetadata,
        fromFlatFieldMetadata,
        toFlatFieldMetadata,
        flatFieldMetadataMaps,
        relatedFlatIndexMetadata: findFieldRelatedIndexes({
          flatFieldMetadata: fromFlatFieldMetadata,
          flatObjectMetadata,
          flatIndexMaps,
        }),
      });
    },
  );

  return [...renamedObjectFlatIndexes, ...renamedFieldFlatIndexes].flatMap(
    ({ universalIdentifier, name: toName }) => {
      const existingFlatIndex =
        flatIndexMaps.byUniversalIdentifier[universalIdentifier];

      if (!isDefined(existingFlatIndex) || existingFlatIndex.name === toName) {
        return [];
      }

      return [
        {
          indexMetadataId: existingFlatIndex.id,
          fromName: existingFlatIndex.name,
          toName,
        },
      ];
    },
  );
};
