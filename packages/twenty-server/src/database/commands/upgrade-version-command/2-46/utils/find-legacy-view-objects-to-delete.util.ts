import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

// Workspace schema objects until 1.8, replaced by core views since 1.5.
export const LEGACY_VIEW_OBJECT_NAME_SINGULARS = [
  'view',
  'viewField',
  'viewFilter',
  'viewFilterGroup',
  'viewGroup',
  'viewSort',
];

export type LegacyViewObjectsToDelete = {
  flatObjectMetadatasToDelete: FlatObjectMetadata[];
  inverseFlatFieldMetadatasToDelete: FlatFieldMetadata[];
  keptFlatObjectMetadatas: {
    flatObjectMetadata: FlatObjectMetadata;
    reason: string;
  }[];
};

// 1.16 moved the leftovers to the workspace custom application, whose table
// naming points them at a prefixed table that was never created. A custom
// object a user named `view` has that table, so it is kept.
export const findLegacyViewObjectsToDelete = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  existingTableNames,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  existingTableNames: Set<string>;
  workspaceCustomApplicationUniversalIdentifier: string;
}): LegacyViewObjectsToDelete => {
  const flatObjectMetadatasToDelete: FlatObjectMetadata[] = [];
  const keptFlatObjectMetadatas: LegacyViewObjectsToDelete['keptFlatObjectMetadatas'] =
    [];

  for (const flatObjectMetadata of Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (
      !LEGACY_VIEW_OBJECT_NAME_SINGULARS.includes(
        flatObjectMetadata.nameSingular,
      )
    ) {
      continue;
    }

    if (
      flatObjectMetadata.applicationUniversalIdentifier !==
      workspaceCustomApplicationUniversalIdentifier
    ) {
      keptFlatObjectMetadatas.push({
        flatObjectMetadata,
        reason: `owned by application ${flatObjectMetadata.applicationUniversalIdentifier}`,
      });
      continue;
    }

    const tableName = computeObjectTargetTable(flatObjectMetadata);

    if (existingTableNames.has(tableName)) {
      keptFlatObjectMetadatas.push({
        flatObjectMetadata,
        reason: `table "${tableName}" exists`,
      });
      continue;
    }

    flatObjectMetadatasToDelete.push(flatObjectMetadata);
  }

  const objectMetadataIdsToDelete = new Set(
    flatObjectMetadatasToDelete.map(({ id }) => id),
  );

  return {
    flatObjectMetadatasToDelete,
    inverseFlatFieldMetadatasToDelete: Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
          isDefined(flatFieldMetadata.relationTargetObjectMetadataId) &&
          objectMetadataIdsToDelete.has(
            flatFieldMetadata.relationTargetObjectMetadataId,
          ) &&
          !objectMetadataIdsToDelete.has(flatFieldMetadata.objectMetadataId),
      ),
    keptFlatObjectMetadatas,
  };
};
