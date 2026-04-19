import { type ApiKeyEntity } from 'src/engine/core-modules/Api-key/Api-key.entity';

export const API_KEY_ENTITY_NON_CACHED_PROPERTIES = [
  'workspace',
] as const satisfies ReadonlyArray<keyof ApiKeyEntity>;
