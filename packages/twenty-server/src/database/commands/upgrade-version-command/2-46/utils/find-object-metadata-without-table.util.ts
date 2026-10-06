import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isMorphOrRelationFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-morph-or-relation-flat-field-metadata.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export type ObjectMetadataWithoutTable = {
  deletableFlatObjectMetadatas: FlatObjectMetadata[];
  inverseFlatFieldMetadatasToDelete: FlatFieldMetadata[];
  nonDeletableFlatObjectMetadatas: FlatObjectMetadata[];
};

// Remote objects are backed by foreign tables, which the catalog read does
// not count as tables. Only workspace custom objects are deleted: that is
// where unknown legacy standard objects were moved in 1.16.
export const findObjectMetadataWithoutTable = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
  existingTableNames,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  existingTableNames: Set<string>;
  workspaceCustomApplicationUniversalIdentifier: string;
}): ObjectMetadataWithoutTable => {
  const flatObjectMetadatasWithoutTable = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(
      (flatObjectMetadata) =>
        !flatObjectMetadata.isRemote &&
        !existingTableNames.has(computeObjectTargetTable(flatObjectMetadata)),
    );

  const deletableFlatObjectMetadatas = flatObjectMetadatasWithoutTable.filter(
    ({ applicationUniversalIdentifier }) =>
      applicationUniversalIdentifier ===
      workspaceCustomApplicationUniversalIdentifier,
  );

  const deletableObjectMetadataIds = new Set(
    deletableFlatObjectMetadatas.map(({ id }) => id),
  );

  return {
    deletableFlatObjectMetadatas,
    inverseFlatFieldMetadatasToDelete: Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (flatFieldMetadata) =>
          isMorphOrRelationFlatFieldMetadata(flatFieldMetadata) &&
          isDefined(flatFieldMetadata.relationTargetObjectMetadataId) &&
          deletableObjectMetadataIds.has(
            flatFieldMetadata.relationTargetObjectMetadataId,
          ) &&
          !deletableObjectMetadataIds.has(flatFieldMetadata.objectMetadataId),
      ),
    nonDeletableFlatObjectMetadatas: flatObjectMetadatasWithoutTable.filter(
      ({ applicationUniversalIdentifier }) =>
        applicationUniversalIdentifier !==
        workspaceCustomApplicationUniversalIdentifier,
    ),
  };
};
