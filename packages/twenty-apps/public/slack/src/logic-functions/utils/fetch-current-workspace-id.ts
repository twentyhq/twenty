import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const CURRENT_WORKSPACE_ID_TIMEOUT_MS = 5_000;

export const fetchCurrentWorkspaceId = async (): Promise<
  string | undefined
> => {
  try {
    const { currentWorkspace } = await new MetadataApiClient({
      signal: AbortSignal.timeout(CURRENT_WORKSPACE_ID_TIMEOUT_MS),
    }).query({
      currentWorkspace: { id: true },
    });

    const workspaceId = currentWorkspace?.id;

    return isNonEmptyString(workspaceId) ? workspaceId : undefined;
  } catch (error) {
    console.warn(
      `[slack] failed to read the current workspace id: ${toErrorMessage(error)}`,
    );

    return undefined;
  }
};
