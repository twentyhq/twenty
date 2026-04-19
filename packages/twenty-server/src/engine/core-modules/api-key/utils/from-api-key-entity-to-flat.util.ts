import { type ApiKeyEntity } from 'src/engine/core-modules/Api-key/Api-key.entity';
import { type FlatApiKey } from 'src/engine/core-modules/Api-key/types/flat-Api-key.type';

export const fromApiKeyEntityToFlat = (entity: ApiKeyEntity): FlatApiKey => ({
  id: entity.id,
  name: entity.name,
  workspaceId: entity.workspaceId,
  expiresAt: entity.expiresAt.toISOString(),
  revokedAt: entity.revokedAt?.toISOString() ?? null,
  createdAt: entity.createdAt.toISOString(),
  updatedAt: entity.updatedAt.toISOString(),
});
