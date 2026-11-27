import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { INBOX_FEATURE_FLAG_KEY } from 'src/logic-functions/constants/inbox-feature-flag-key';
import { fetchWithRateLimitRetry } from 'src/logic-functions/utils/fetch-with-rate-limit-retry.util';

export const isInboxEnabled = async (): Promise<boolean> => {
  const metadataClient = new MetadataApiClient({
    fetch: fetchWithRateLimitRetry,
  });
  const { currentWorkspace } = await metadataClient.query({
    currentWorkspace: { featureFlags: { key: true, value: true } },
  });

  return (currentWorkspace.featureFlags ?? []).some(
    ({ key, value }) => key === INBOX_FEATURE_FLAG_KEY && value,
  );
};
