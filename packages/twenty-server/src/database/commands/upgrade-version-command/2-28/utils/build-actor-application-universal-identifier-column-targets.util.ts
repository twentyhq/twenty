import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';

export type ActorApplicationUniversalIdentifierColumnTarget = {
  tableName: string;
  columnNames: string[];
};

const ACTOR_APPLICATION_UNIVERSAL_IDENTIFIER_COLUMN_SUFFIX =
  'ApplicationUniversalIdentifier';

export const buildActorApplicationUniversalIdentifierColumnTargets = ({
  flatObjectMetadataMaps,
  flatFieldMetadataMaps,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
}): ActorApplicationUniversalIdentifierColumnTarget[] => {
  const columnNamesByTableName = new Map<string, string[]>();

  for (const flatFieldMetadata of Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined)) {
    if (flatFieldMetadata.type !== FieldMetadataType.ACTOR) {
      continue;
    }

    const flatObjectMetadata =
      flatObjectMetadataMaps.byUniversalIdentifier[
        flatFieldMetadata.objectMetadataUniversalIdentifier
      ];

    if (!isDefined(flatObjectMetadata) || flatObjectMetadata.isRemote) {
      continue;
    }

    const tableName = computeObjectTargetTable(flatObjectMetadata);
    const columnName = `${flatFieldMetadata.name}${ACTOR_APPLICATION_UNIVERSAL_IDENTIFIER_COLUMN_SUFFIX}`;
    const existingColumnNames = columnNamesByTableName.get(tableName) ?? [];

    columnNamesByTableName.set(tableName, [...existingColumnNames, columnName]);
  }

  return [...columnNamesByTableName.entries()].map(
    ([tableName, columnNames]) => ({ tableName, columnNames }),
  );
};
