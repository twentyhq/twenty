import {
  EMPTY_EVENT_SCHEMA,
  type EventManifest,
} from 'twenty-shared/application';

import { type UniversalFlatEventMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-event-metadata.type';

export const fromEventManifestToUniversalFlatEventMetadata = ({
  eventManifest,
  applicationUniversalIdentifier,
  now,
}: {
  eventManifest: EventManifest;
  applicationUniversalIdentifier: string;
  now: string;
}): UniversalFlatEventMetadata => ({
  universalIdentifier: eventManifest.universalIdentifier,
  applicationUniversalIdentifier,
  name: eventManifest.name,
  label: eventManifest.label,
  description: eventManifest.description ?? null,
  icon: eventManifest.icon ?? null,
  schema: eventManifest.schema ?? EMPTY_EVENT_SCHEMA,
  capabilities: eventManifest.capabilities ?? {},
  createdAt: now,
  updatedAt: now,
});
