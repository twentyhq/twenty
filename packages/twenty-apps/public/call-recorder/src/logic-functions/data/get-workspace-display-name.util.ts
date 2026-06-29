import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

export const getWorkspaceDisplayName = async (): Promise<string | undefined> => {
  try {
    const metadataClient = new MetadataApiClient();

    const queryResult = await metadataClient.query({
      currentWorkspace: { displayName: true },
    });

    const displayName = queryResult.currentWorkspace?.displayName;

    return isNonEmptyString(displayName) ? displayName.trim() : undefined;
  } catch (error) {
    console.warn(
      `[call-recorder] failed to read workspace name: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
