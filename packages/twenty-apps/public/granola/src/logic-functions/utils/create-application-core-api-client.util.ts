import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

export const createApplicationCoreApiClient = (): CoreApiClient =>
  new CoreApiClient({ runAs: 'application', fetch: fetchWithRateLimitRetry });
