import { isDefined } from 'twenty-shared/utils';

import { INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-66/constants/inbox-object-names-by-universal-identifier.constant';
import { resolveAvailableOldNameSuffixes } from 'src/database/commands/upgrade-version-command/2-66/utils/resolve-available-old-name-suffixes.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildInboxNameCollisionFlatObjectMetadataUpdates = ({
  flatObjectMetadataMaps,
  now,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  now: string;
}): FlatObjectMetadata[] => {
  const flatObjectMetadatas = Object.values(
    flatObjectMetadataMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const inboxObjectNames = new Set(
    Object.values(INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER)
      .filter(isDefined)
      .flatMap(({ nameSingular, namePlural }) => [nameSingular, namePlural]),
  );

  const takenNames = new Set(
    flatObjectMetadatas.flatMap(({ nameSingular, namePlural }) => [
      nameSingular,
      namePlural,
    ]),
  );

  return flatObjectMetadatas
    .filter(
      ({ universalIdentifier, nameSingular, namePlural }) =>
        !isDefined(
          INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER[universalIdentifier],
        ) &&
        (inboxObjectNames.has(nameSingular) ||
          inboxObjectNames.has(namePlural)),
    )
    .map((collidingFlatObjectMetadata) => {
      const { nameSuffix, labelSuffix } = resolveAvailableOldNameSuffixes({
        names: [
          collidingFlatObjectMetadata.nameSingular,
          collidingFlatObjectMetadata.namePlural,
        ],
        takenNames,
      });
      const nameSingular = `${collidingFlatObjectMetadata.nameSingular}${nameSuffix}`;
      const namePlural = `${collidingFlatObjectMetadata.namePlural}${nameSuffix}`;

      takenNames.add(nameSingular);
      takenNames.add(namePlural);

      return {
        ...collidingFlatObjectMetadata,
        nameSingular,
        namePlural,
        labelSingular: `${collidingFlatObjectMetadata.labelSingular}${labelSuffix}`,
        labelPlural: `${collidingFlatObjectMetadata.labelPlural}${labelSuffix}`,
        isLabelSyncedWithName: false,
        updatedAt: now,
      };
    });
};
