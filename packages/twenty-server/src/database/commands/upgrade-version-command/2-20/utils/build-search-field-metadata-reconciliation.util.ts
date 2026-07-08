import {
  getFieldUniversalIdentifier,
  getSearchFieldUniversalIdentifier,
} from 'twenty-shared/application';
import {
  fromArrayToValuesByKeyRecord,
  isDefined,
  isSearchableFieldType,
} from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { findTsVectorFlatFieldMetadataForObject } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/find-ts-vector-flat-field-metadata-for-object.util';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';

export type SearchFieldMetadataUniversalIdentifierUpdate = {
  id: string;
  deterministicUniversalIdentifier: string;
};

type BuildSearchFieldMetadataReconciliationArgs = {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  flatSearchFieldMetadataMaps: FlatEntityMaps<FlatSearchFieldMetadata>;
  applicationUniversalIdentifierById: Map<string, string>;
  installedApplicationIds: Set<string>;
};

type BuildSearchFieldMetadataReconciliationReturnType = {
  searchFieldMetadataUniversalIdentifierUpdates: SearchFieldMetadataUniversalIdentifierUpdate[];
  flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier: Record<
    string,
    UniversalFlatSearchFieldMetadata[]
  >;
};

// Reconciles the deterministic universal identifier of searchFieldMetadata rows.
// Re-own is global (every application): existing rows carrying a legacy v4 identifier
// are converged to getSearchFieldUniversalIdentifier. Creation is limited to installed-app
// searchable objects, whose row was never provisioned by the manifest funnel. The
// creation rule mirrors the object-create side effect handler (label-identifier field of
// a searchable type; junction/id-label objects have no search surface).
export const buildSearchFieldMetadataReconciliation = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  flatSearchFieldMetadataMaps,
  applicationUniversalIdentifierById,
  installedApplicationIds,
}: BuildSearchFieldMetadataReconciliationArgs): BuildSearchFieldMetadataReconciliationReturnType => {
  const searchFieldMetadataUniversalIdentifierUpdates: SearchFieldMetadataUniversalIdentifierUpdate[] =
    [];
  const existingSearchFieldMetadataKeys = new Set<string>();

  for (const flatSearchFieldMetadata of Object.values(
    flatSearchFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    existingSearchFieldMetadataKeys.add(
      `${flatSearchFieldMetadata.objectMetadataId}:${flatSearchFieldMetadata.fieldMetadataId}`,
    );

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

  const flatSearchFieldMetadatasToCreate: UniversalFlatSearchFieldMetadata[] =
    [];

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (!installedApplicationIds.has(flatObjectMetadata.applicationId)) {
      continue;
    }

    if (flatObjectMetadata.isSearchable !== true) {
      continue;
    }

    const applicationUniversalIdentifier =
      applicationUniversalIdentifierById.get(flatObjectMetadata.applicationId);

    if (!isDefined(applicationUniversalIdentifier)) {
      continue;
    }

    const labelIdentifierFieldMetadataUniversalIdentifier =
      flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier;

    if (!isDefined(labelIdentifierFieldMetadataUniversalIdentifier)) {
      continue;
    }

    const derivedIdFieldUniversalIdentifier = getFieldUniversalIdentifier({
      applicationUniversalIdentifier,
      objectUniversalIdentifier: flatObjectMetadata.universalIdentifier,
      name: 'id',
    });

    if (
      labelIdentifierFieldMetadataUniversalIdentifier ===
      derivedIdFieldUniversalIdentifier
    ) {
      continue;
    }

    const labelIdentifierFlatFieldMetadata =
      flatFieldMetadataMaps.byUniversalIdentifier[
        labelIdentifierFieldMetadataUniversalIdentifier
      ];

    if (
      !isDefined(labelIdentifierFlatFieldMetadata) ||
      !isSearchableFieldType(labelIdentifierFlatFieldMetadata.type)
    ) {
      continue;
    }

    if (
      existingSearchFieldMetadataKeys.has(
        `${flatObjectMetadata.id}:${labelIdentifierFlatFieldMetadata.id}`,
      )
    ) {
      continue;
    }

    const tsVectorFlatFieldMetadata = findTsVectorFlatFieldMetadataForObject({
      fieldUniversalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
      flatFieldMetadataMaps,
    });

    if (!isDefined(tsVectorFlatFieldMetadata)) {
      continue;
    }

    flatSearchFieldMetadatasToCreate.push(
      buildFlatSearchFieldMetadataForField({
        flatObjectMetadata,
        flatFieldMetadata: labelIdentifierFlatFieldMetadata,
        tsVectorFlatFieldMetadata,
        position: 0,
      }),
    );
  }

  return {
    searchFieldMetadataUniversalIdentifierUpdates,
    flatSearchFieldMetadatasToCreateByApplicationUniversalIdentifier:
      fromArrayToValuesByKeyRecord({
        array: flatSearchFieldMetadatasToCreate,
        key: 'applicationUniversalIdentifier',
      }),
  };
};
