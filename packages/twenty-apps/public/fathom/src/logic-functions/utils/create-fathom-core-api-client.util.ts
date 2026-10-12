import { CoreApiClient } from 'twenty-client-sdk/core';

import { createFetchWithRateLimitRetry } from 'src/logic-functions/utils/create-fetch-with-rate-limit-retry.util';

export const createFathomCoreApiClient = (): CoreApiClient =>
  new CoreApiClient({
    runAs: 'application',
    fetch: createFetchWithRateLimitRetry(),
  });
