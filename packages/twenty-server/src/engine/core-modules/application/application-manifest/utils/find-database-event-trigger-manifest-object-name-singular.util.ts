import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';

export const findDatabaseEventTriggerManifestObjectNameSingular = ({
  lookup,
  objectUniversalIdentifier,
}: {
  lookup: DatabaseEventTriggerManifestLookup;
  objectUniversalIdentifier: string;
}): string | undefined =>
  lookup.objectMaps
    .map((maps) => maps.byUniversalIdentifier[objectUniversalIdentifier])
    .find(isDefined)?.nameSingular;
