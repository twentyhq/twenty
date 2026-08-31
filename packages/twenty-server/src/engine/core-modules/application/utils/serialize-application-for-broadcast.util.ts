import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';

// Broadcast payloads land in the front metadata store as-is, so they carry the
// columns the store holds and nothing else: a raw row would put every column,
// including the ones the store does not model, next to the seeded shape.
export const serializeApplicationForBroadcast = (
  application: ApplicationEntity,
): Record<string, unknown> => ({
  id: application.id,
  universalIdentifier: application.universalIdentifier,
  name: application.name,
  state: application.state,
  version: application.version,
});
