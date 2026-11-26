import { CoreApiClient } from 'twenty-client-sdk/core';

import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

// Acts as the app, not as the member who started the run: bookings follow stored settings.
export const createCoreApiClientRunningAsApplication = (): CoreApiClient =>
  new CoreApiClient({ runAs: 'application', fetch: fetchWithRateLimitRetry });
