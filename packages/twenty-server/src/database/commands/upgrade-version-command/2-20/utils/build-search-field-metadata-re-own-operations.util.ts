import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';

export type SearchFieldMetadataUniversalIdentifierUpdate = {
  id: string;
  deterministicUniversalIdentifier: string;
};

type BuildSearchFieldMetadataReOwnOperationsArgs = {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  applicationUniversalIdentifierById: Map<string, string>;
};

// Re-own is global (every application, including twenty-standard and workspace-custom):
// every existing searchFieldMetadata row whose universal identifier drifted from its
// getSearchFieldUniversalIdentifier derivation is converged back to it.
export const buildSearchFieldMetadataReOwnOperations = ({
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
  applicationUniversalIdentifierById,
}: BuildSearchFieldMetadataReOwnOperationsArgs): SearchFieldMetadataUniversalIdentifierUpdate[] => {
  const searchFieldMetadataUniversalIdentifierUpdates: SearchFieldMetadataUniversalIdentifierUpdate[] =
    [];

  for (const flatSearchFieldMetadata of Object.values(
    flatSearchFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    const applicationUniversalIdentifier =
      applicationUniversalIdentifierById.get(
        flatSearchFieldMetadata.applicationId,
      );
    const indexedFlatFieldMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      flatEntityId: flatSearchFieldMetadata.fieldMetadataId,
    });

    if (
      !isDefined(applicationUniversalIdentifier) ||
      !isDefined(indexedFlatFieldMetadata)
    ) {
      continue;
    }

    const deterministicUniversalIdentifier = getSearchFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      fieldMetadataUniversalIdentifier:
        indexedFlatFieldMetadata.universalIdentifier,
    });

    if (
      deterministicUniversalIdentifier ===
      flatSearchFieldMetadata.universalIdentifier
    ) {
      continue;
    }

    searchFieldMetadataUniversalIdentifierUpdates.push({
      id: flatSearchFieldMetadata.id,
      deterministicUniversalIdentifier,
    });
  }

  return searchFieldMetadataUniversalIdentifierUpdates;
};
