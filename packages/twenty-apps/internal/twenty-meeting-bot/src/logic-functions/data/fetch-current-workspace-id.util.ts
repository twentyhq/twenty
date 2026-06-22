import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { getString } from 'src/logic-functions/utils/get-string.util';

export const fetchCurrentWorkspaceId = async (): Promise<string | undefined> => {
  const { currentWorkspace } = await new MetadataApiClient().query({
    currentWorkspace: { id: true },
  });

  return getString(currentWorkspace?.id);
};
