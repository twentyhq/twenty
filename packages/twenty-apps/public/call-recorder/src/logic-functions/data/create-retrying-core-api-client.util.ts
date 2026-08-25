import { CoreApiClient } from 'twenty-client-sdk/core';

import { createCoreApiRetryingFetch } from 'src/logic-functions/data/core-api-retrying-fetch.util';

export const createRetryingCoreApiClient = (): CoreApiClient =>
  new CoreApiClient({ fetch: createCoreApiRetryingFetch() });
