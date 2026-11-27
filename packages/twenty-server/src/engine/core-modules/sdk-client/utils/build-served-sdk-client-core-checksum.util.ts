import { isDefined } from 'twenty-shared/utils';

import { SDK_CLIENT_GENERATION_KEY } from 'src/engine/core-modules/sdk-client/constants/sdk-client-generation-key';

// Browsers cache the core module as immutable under this value, so it carries
// the generation key to drop copies cached before a key change.
export const buildServedSdkClientCoreChecksum = (
  sdkClientCoreChecksum: string | null,
): string | null =>
  isDefined(sdkClientCoreChecksum)
    ? `${SDK_CLIENT_GENERATION_KEY}-${sdkClientCoreChecksum}`
    : null;
