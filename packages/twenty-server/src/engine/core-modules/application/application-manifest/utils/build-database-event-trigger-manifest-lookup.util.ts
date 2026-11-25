import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { buildReservedSystemFlatFieldMetadatasForCustomObject } from 'src/engine/metadata-modules/object-metadata/utils/build-reserved-system-flat-field-metadatas-for-custom-object.util';

export const buildDatabaseEventTriggerManifestLookup = ({
  manifestFlatEntityMaps,
  existingFlatEntityMaps,
}: {
  manifestFlatEntityMaps: AllFlatEntityMaps;
  existingFlatEntityMaps: AllFlatEntityMaps;
}): DatabaseEventTriggerManifestLookup => {
  // System fields of a new object (id, createdAt...) are only added once it is created
  const reservedFieldsOfNewObjects = Object.fromEntries(
    Object.values(
      manifestFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatObjectMetadata) =>
          !isDefined(
            existingFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
              flatObjectMetadata.universalIdentifier
            ],
          ),
      )
      .flatMap((flatObjectMetadata) =>
        Object.values(
          buildReservedSystemFlatFieldMetadatasForCustomObject({
            flatObjectMetadata,
          }),
        ),
      )
      .map((field) => [field.universalIdentifier, field]),
  );

  return {
    objectMaps: [
      manifestFlatEntityMaps.flatObjectMetadataMaps,
      existingFlatEntityMaps.flatObjectMetadataMaps,
    ],
    fieldMaps: [
      manifestFlatEntityMaps.flatFieldMetadataMaps,
      { byUniversalIdentifier: reservedFieldsOfNewObjects },
      existingFlatEntityMaps.flatFieldMetadataMaps,
    ],
  };
};
