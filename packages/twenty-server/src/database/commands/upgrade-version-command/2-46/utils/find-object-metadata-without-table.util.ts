import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export type ObjectMetadataWithoutTable = {
  deletableFlatObjectMetadatas: FlatObjectMetadata[];
  nonDeletableFlatObjectMetadatas: FlatObjectMetadata[];
};

// Remote objects are backed by foreign tables, which the catalog read does
// not count as tables. Only workspace custom objects are deleted: that is
// where unknown legacy standard objects were moved in 1.16.
export const findObjectMetadataWithoutTable = ({
  flatObjectMetadataMaps,
  existingTableNames,
  workspaceCustomApplicationUniversalIdentifier,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
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

  return {
    deletableFlatObjectMetadatas: flatObjectMetadatasWithoutTable.filter(
      ({ applicationUniversalIdentifier }) =>
        applicationUniversalIdentifier ===
        workspaceCustomApplicationUniversalIdentifier,
    ),
    nonDeletableFlatObjectMetadatas: flatObjectMetadatasWithoutTable.filter(
      ({ applicationUniversalIdentifier }) =>
        applicationUniversalIdentifier !==
        workspaceCustomApplicationUniversalIdentifier,
    ),
  };
};
