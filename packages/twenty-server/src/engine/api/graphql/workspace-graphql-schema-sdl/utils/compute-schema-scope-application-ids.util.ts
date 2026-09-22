import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntitiesByApplicationId } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entities-by-application-id.util';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// A relation field can target an object owned by another application (another
// app or the workspace custom application): that owner must be in the schema
// scope for the relation to be typed, and its own relations must be followed too.
export const computeSchemaScopeApplicationIds = ({
  initialApplicationIds,
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  initialApplicationIds: string[];
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): string[] => {
  const scopeApplicationIds = new Set(initialApplicationIds);
  const applicationIdsToVisit = [...scopeApplicationIds];

  while (applicationIdsToVisit.length > 0) {
    const applicationId = applicationIdsToVisit.pop();

    if (!isDefined(applicationId)) {
      continue;
    }

    const relationFlatFieldMetadatas = findFlatEntitiesByApplicationId({
      applicationId,
      flatEntityMaps: flatFieldMetadataMaps,
    }).filter(isMorphOrRelationFlatFieldMetadata);

    for (const relationFlatFieldMetadata of relationFlatFieldMetadatas) {
      if (
        !isDefined(relationFlatFieldMetadata.relationTargetObjectMetadataId)
      ) {
        continue;
      }

      const targetFlatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: relationFlatFieldMetadata.relationTargetObjectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (
        !isDefined(targetFlatObjectMetadata) ||
        scopeApplicationIds.has(targetFlatObjectMetadata.applicationId)
      ) {
        continue;
      }

      scopeApplicationIds.add(targetFlatObjectMetadata.applicationId);
      applicationIdsToVisit.push(targetFlatObjectMetadata.applicationId);
    }
  }

  return [...scopeApplicationIds];
};
