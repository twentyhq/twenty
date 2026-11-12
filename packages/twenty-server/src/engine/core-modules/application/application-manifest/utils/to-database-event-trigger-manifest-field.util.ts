import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-field.type';
import { type DatabaseEventTriggerManifestLookupField } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';

export const toDatabaseEventTriggerManifestField = ({
  universalIdentifier,
  name,
  type,
  objectMetadataUniversalIdentifier,
  universalSettings,
}: DatabaseEventTriggerManifestLookupField): DatabaseEventTriggerManifestField => ({
  universalIdentifier,
  name,
  type,
  objectUniversalIdentifier: objectMetadataUniversalIdentifier,
  universalSettings,
  relationType:
    isDefined(universalSettings) && 'relationType' in universalSettings
      ? universalSettings.relationType
      : undefined,
});
