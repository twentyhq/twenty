import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';

export const isApiKeyExpired = (
  apiKey: Pick<ApiKeyEntity | FlatApiKey, 'expiresAt'>,
): boolean => Date.now() > new Date(apiKey.expiresAt).getTime();
