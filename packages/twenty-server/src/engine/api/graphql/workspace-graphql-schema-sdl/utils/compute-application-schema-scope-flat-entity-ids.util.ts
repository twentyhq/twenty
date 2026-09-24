import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type ApplicationSchemaScopeFlatEntityIds = {
  flatObjectMetadataIds: string[];
  flatFieldMetadataIds: string[];
  flatIndexMetadataIds: string[];
};

export const computeApplicationSchemaScopeFlatEntityIds = ({
  applicationId,
  twentyStandardApplicationId,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatIndexMaps,
}: {
  applicationId: string;
  twentyStandardApplicationId?: string;
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatIndexMaps?: FlatEntityMaps<FlatIndexMetadata>;
}): ApplicationSchemaScopeFlatEntityIds => {
  const scopeApplicationIds = isDefined(twentyStandardApplicationId)
    ? [twentyStandardApplicationId, applicationId]
    : [applicationId];

  const flatObjectMetadataIds = new Set(
    scopeApplicationIds.flatMap((scopeApplicationId) =>
      findFlatEntitiesByApplicationId({
        applicationId: scopeApplicationId,
        flatEntityMaps: flatObjectMetadataMaps,
      }).map((flatObjectMetadata) => flatObjectMetadata.id),
    ),
  );

  const flatFieldMetadataIds = new Set(
    scopeApplicationIds.flatMap((scopeApplicationId) =>
      findFlatEntitiesByApplicationId({
        applicationId: scopeApplicationId,
        flatEntityMaps: flatFieldMetadataMaps,
      }).map((flatFieldMetadata) => flatFieldMetadata.id),
    ),
  );

  const relationFlatFieldMetadatasToVisit = findFlatEntitiesByApplicationId({
    applicationId,
    flatEntityMaps: flatFieldMetadataMaps,
  }).filter(isMorphOrRelationFlatFieldMetadata);

  while (relationFlatFieldMetadatasToVisit.length > 0) {
    const relationFlatFieldMetadata = relationFlatFieldMetadatasToVisit.pop();

    if (!isDefined(relationFlatFieldMetadata)) {
      break;
    }

    const { relationTargetObjectMetadataId } = relationFlatFieldMetadata;

    if (
      !isDefined(relationTargetObjectMetadataId) ||
      flatObjectMetadataIds.has(relationTargetObjectMetadataId)
    ) {
      continue;
    }

    const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: relationTargetObjectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!isDefined(targetFlatObjectMetadata)) {
      continue;
    }

    flatObjectMetadataIds.add(targetFlatObjectMetadata.id);

    const targetOwnerFlatFieldMetadatas =
      findManyFlatEntityByIdInFlatEntityMaps({
        flatEntityIds: targetFlatObjectMetadata.fieldIds,
        flatEntityMaps: flatFieldMetadataMaps,
      }).filter(
        (flatFieldMetadata) =>
          flatFieldMetadata.applicationId ===
            targetFlatObjectMetadata.applicationId &&
          !flatFieldMetadataIds.has(flatFieldMetadata.id),
      );

    for (const targetOwnerFlatFieldMetadata of targetOwnerFlatFieldMetadatas) {
      flatFieldMetadataIds.add(targetOwnerFlatFieldMetadata.id);

      if (isMorphOrRelationFlatFieldMetadata(targetOwnerFlatFieldMetadata)) {
        relationFlatFieldMetadatasToVisit.push(targetOwnerFlatFieldMetadata);
      }
    }
  }

  const flatIndexMetadataIds = isDefined(flatIndexMaps)
    ? [...flatObjectMetadataIds].flatMap((flatObjectMetadataId) => {
        const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: flatObjectMetadataId,
          flatEntityMaps: flatObjectMetadataMaps,
        });

        if (!isDefined(flatObjectMetadata)) {
          return [];
        }

        return findManyFlatEntityByIdInFlatEntityMaps({
          flatEntityIds: flatObjectMetadata.indexMetadataIds,
          flatEntityMaps: flatIndexMaps,
        })
          .filter(
            (flatIndexMetadata) =>
              scopeApplicationIds.includes(flatIndexMetadata.applicationId) ||
              flatIndexMetadata.applicationId ===
                flatObjectMetadata.applicationId,
          )
          .map((flatIndexMetadata) => flatIndexMetadata.id);
      })
    : [];

  return {
    flatObjectMetadataIds: [...flatObjectMetadataIds],
    flatFieldMetadataIds: [...flatFieldMetadataIds],
    flatIndexMetadataIds,
  };
};
