import { isDefined } from 'twenty-shared/utils';

import { type DatabaseEventTriggerManifestField } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-field.type';
import { type DatabaseEventTriggerManifestLookupField } from 'src/engine/core-modules/application/application-manifest/types/database-event-trigger-manifest-lookup.type';

export const toDatabaseEventTriggerManifestField = ({
  universalIdentifier,
  name,
  type,
  objectMetadataUniversalIdentifier,
  universalSettings,
  relationTargetObjectMetadataUniversalIdentifier,
}: DatabaseEventTriggerManifestLookupField): DatabaseEventTriggerManifestField => ({
  universalIdentifier,
  name,
  type,
  objectUniversalIdentifier: objectMetadataUniversalIdentifier,
  relationType:
    isDefined(universalSettings) && 'relationType' in universalSettings
      ? universalSettings.relationType
      : undefined,
  relationTargetObjectUniversalIdentifier:
    relationTargetObjectMetadataUniversalIdentifier ?? undefined,
});
