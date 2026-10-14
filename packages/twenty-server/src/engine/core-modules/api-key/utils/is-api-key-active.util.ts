import { isDefined } from 'twenty-shared/utils';

import { type ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { isApiKeyExpired } from 'src/engine/core-modules/api-key/utils/is-api-key-expired.util';

export const isApiKeyActive = (
  apiKey: Pick<ApiKeyEntity | FlatApiKey, 'revokedAt' | 'expiresAt'>,
): boolean => !isDefined(apiKey.revokedAt) && !isApiKeyExpired(apiKey);
