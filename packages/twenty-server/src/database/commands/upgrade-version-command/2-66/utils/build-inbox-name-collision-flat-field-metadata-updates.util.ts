import { isDefined } from 'twenty-shared/utils';

import { isManyToOneFlatFieldMetadata } from 'src/database/commands/upgrade-version-command/2-66/utils/is-many-to-one-flat-field-metadata.util';
import { renameFlatFieldMetadata } from 'src/database/commands/upgrade-version-command/2-66/utils/rename-flat-field-metadata.util';
import { resolveAvailableOldNameSuffixes } from 'src/database/commands/upgrade-version-command/2-66/utils/resolve-available-old-name-suffixes.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';

export const buildInboxNameCollisionFlatFieldMetadataUpdates = ({
  flatFieldMetadataMaps,
  inboxRelationFlatFieldMetadataUpdates,
  now,
}: {
  flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
  inboxRelationFlatFieldMetadataUpdates: FlatFieldMetadata[];
  now: string;
}): FlatFieldMetadata[] => {
  const flatFieldMetadatas = Object.values(
    flatFieldMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  return inboxRelationFlatFieldMetadataUpdates.flatMap(
    (inboxRelationFlatFieldMetadata) => {
      const objectFlatFieldMetadatas = flatFieldMetadatas.filter(
        ({ objectMetadataUniversalIdentifier }) =>
          objectMetadataUniversalIdentifier ===
          inboxRelationFlatFieldMetadata.objectMetadataUniversalIdentifier,
      );
      const takenNames = new Set(
        objectFlatFieldMetadatas.map(({ name }) => name),
      );
      const reservedNames = [
        inboxRelationFlatFieldMetadata.name,
        ...(isManyToOneFlatFieldMetadata(inboxRelationFlatFieldMetadata)
          ? [inboxRelationFlatFieldMetadata.universalSettings.joinColumnName]
          : []),
      ];

      return objectFlatFieldMetadatas
        .filter(
          ({ universalIdentifier, name }) =>
            universalIdentifier !==
              inboxRelationFlatFieldMetadata.universalIdentifier &&
            reservedNames.includes(name),
        )
        .map((collidingFlatFieldMetadata) => {
          const { nameSuffix, labelSuffix } = resolveAvailableOldNameSuffixes({
            names: [collidingFlatFieldMetadata.name],
            takenNames,
          });
          const name = `${collidingFlatFieldMetadata.name}${nameSuffix}`;

          takenNames.add(name);

          return {
            ...renameFlatFieldMetadata({
              flatFieldMetadata: collidingFlatFieldMetadata,
              name,
              now,
            }),
            label: `${collidingFlatFieldMetadata.label}${labelSuffix}`,
            isLabelSyncedWithName: false,
          };
        });
    },
  );
};
