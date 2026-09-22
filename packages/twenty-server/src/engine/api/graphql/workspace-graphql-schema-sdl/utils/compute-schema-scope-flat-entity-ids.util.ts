import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// A relation field can target an object owned by an application outside the
// schema scope (another app or the workspace custom application). Only that
// target object and the fields its owner defines on it are pulled in, so the
// relation can be typed without exposing the rest of the other application.
export const computeSchemaScopeFlatEntityIds = ({
  applicationIds,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  applicationIds: string[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): { flatObjectMetadataIds: string[]; flatFieldMetadataIds: string[] } => {
  const flatObjectMetadataIds = new Set(
    applicationIds.flatMap((applicationId) =>
      findFlatEntitiesByApplicationId({
        applicationId,
        flatEntityMaps: flatObjectMetadataMaps,
      }).map((flatObjectMetadata) => flatObjectMetadata.id),
    ),
  );

  const scopeFlatFieldMetadatas = applicationIds.flatMap((applicationId) =>
    findFlatEntitiesByApplicationId({
      applicationId,
      flatEntityMaps: flatFieldMetadataMaps,
    }),
  );

  const flatFieldMetadataIds = new Set(
    scopeFlatFieldMetadatas.map((flatFieldMetadata) => flatFieldMetadata.id),
  );

  const flatFieldMetadatasToVisit = [...scopeFlatFieldMetadatas];

  while (flatFieldMetadatasToVisit.length > 0) {
    const flatFieldMetadata = flatFieldMetadatasToVisit.pop();

    if (
      !isDefined(flatFieldMetadata) ||
      !isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) ||
      !isDefined(flatFieldMetadata.relationTargetObjectMetadataId) ||
      flatObjectMetadataIds.has(
        flatFieldMetadata.relationTargetObjectMetadataId,
      )
    ) {
      continue;
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: flatFieldMetadata.relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      continue;
    }

    flatObjectMetadataIds.add(targetFlatObjectMetadata.id);

    for (const targetFlatFieldMetadataId of targetFlatObjectMetadata.fieldIds) {
      const targetFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: targetFlatFieldMetadataId,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      if (
        !isDefined(targetFlatFieldMetadata) ||
        targetFlatFieldMetadata.applicationId !==
          targetFlatObjectMetadata.applicationId ||
        flatFieldMetadataIds.has(targetFlatFieldMetadata.id)
      ) {
        continue;
      }

      flatFieldMetadataIds.add(targetFlatFieldMetadata.id);
      flatFieldMetadatasToVisit.push(targetFlatFieldMetadata);
    }
  }

  return {
    flatObjectMetadataIds: [...flatObjectMetadataIds],
    flatFieldMetadataIds: [...flatFieldMetadataIds],
  };
};
