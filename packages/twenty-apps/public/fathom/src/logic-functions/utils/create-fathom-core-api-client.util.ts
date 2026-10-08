import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

// The Twenty API rate limit is shared by every workspace that installs the app.
export const createFathomCoreApiClient = (): CoreApiClient =>
  new CoreApiClient({ runAs: 'application', fetch: fetchWithRateLimitRetry });
