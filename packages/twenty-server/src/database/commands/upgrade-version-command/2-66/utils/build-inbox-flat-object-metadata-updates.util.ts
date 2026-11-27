import { isDefined } from 'twenty-shared/utils';

import { INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER } from 'src/database/commands/upgrade-version-command/2-66/constants/inbox-object-names-by-universal-identifier.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const buildInboxFlatObjectMetadataUpdates = ({
  flatObjectMetadataMaps,
  now,
}: {
  flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
  now: string;
}): FlatObjectMetadata[] =>
  Object.entries(INBOX_OBJECT_NAMES_BY_UNIVERSAL_IDENTIFIER).flatMap(
    ([universalIdentifier, inboxObjectNames]) => {
      const flatObjectMetadata =
        flatObjectMetadataMaps.byUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(flatObjectMetadata) ||
        !isDefined(inboxObjectNames) ||
        (flatObjectMetadata.nameSingular === inboxObjectNames.nameSingular &&
          flatObjectMetadata.namePlural === inboxObjectNames.namePlural)
      ) {
        return [];
      }

      return [{ ...flatObjectMetadata, ...inboxObjectNames, updatedAt: now }];
    },
  );
