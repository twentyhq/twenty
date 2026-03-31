import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';

export const API_KEY_ENTITY_NON_CACHED_PROPERTIES = [
  'workspace',
] as const satisfies ReadonlyArray<keyof ApiKeyEntity>;
