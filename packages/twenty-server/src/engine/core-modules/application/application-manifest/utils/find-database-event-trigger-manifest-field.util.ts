import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-field.type';
import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';
import { toDatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/utils/to-database-event-trigger-manifest-field.util';

export const findDatabaseEventTriggerManifestField = ({
  lookup,
  fieldUniversalIdentifier,
}: {
  lookup: DatabaseEventTriggerManifestLookup;
  fieldUniversalIdentifier: string;
}): DatabaseEventTriggerManifestField | undefined => {
  const field = lookup.fieldMaps
    .map((maps) => maps.byUniversalIdentifier[fieldUniversalIdentifier])
    .find(isDefined);

  return isDefined(field)
    ? toDatabaseEventTriggerManifestField(field)
    : undefined;
};
