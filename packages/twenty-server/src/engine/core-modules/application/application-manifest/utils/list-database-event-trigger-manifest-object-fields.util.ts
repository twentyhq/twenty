import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-field.type';
import { type DatabaseEventTriggerManifestLookup } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';
import { toDatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/utils/to-database-event-trigger-manifest-field.util';

export const listDatabaseEventTriggerManifestObjectFields = ({
  lookup,
  objectUniversalIdentifier,
}: {
  lookup: Pick<DatabaseEventTriggerManifestLookup, 'fieldMaps'>;
  objectUniversalIdentifier: string;
}): DatabaseEventTriggerManifestField[] => {
  const fieldsByUniversalIdentifier = new Map<
    string,
    DatabaseEventTriggerManifestField
  >();

  for (const maps of lookup.fieldMaps) {
    for (const field of Object.values(maps.byUniversalIdentifier)) {
      if (
        isDefined(field) &&
        field.objectMetadataUniversalIdentifier === objectUniversalIdentifier &&
        !fieldsByUniversalIdentifier.has(field.universalIdentifier)
      ) {
        fieldsByUniversalIdentifier.set(
          field.universalIdentifier,
          toDatabaseEventTriggerManifestField(field),
        );
      }
    }
  }

  return [...fieldsByUniversalIdentifier.values()];
};
