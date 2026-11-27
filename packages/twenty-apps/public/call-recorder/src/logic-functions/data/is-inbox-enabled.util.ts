import { type MetadataApiClient } from 'twenty-client-sdk/metadata';

import { INBOX_FEATURE_FLAG_KEY } from 'src/logic-functions/constants/inbox-feature-flag-key';

export const isInboxEnabled = async ({
  metadataClient,
}: {
  metadataClient: Pick<MetadataApiClient, 'query'>;
}): Promise<boolean> => {
  const { currentWorkspace } = await metadataClient.query({
    currentWorkspace: { featureFlags: { key: true, value: true } },
  });

  return (currentWorkspace.featureFlags ?? []).some(
    ({ key, value }) => key === INBOX_FEATURE_FLAG_KEY && value,
  );
};
