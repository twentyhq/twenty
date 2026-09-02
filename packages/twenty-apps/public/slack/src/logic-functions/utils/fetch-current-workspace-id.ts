import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export const fetchCurrentWorkspaceId = async (): Promise<
  string | undefined
> => {
  try {
    const { currentWorkspace } = await new MetadataApiClient().query({
      currentWorkspace: { id: true },
    });

    const workspaceId = currentWorkspace?.id;

    return isNonEmptyString(workspaceId) ? workspaceId : undefined;
  } catch (error) {
    console.warn(
      `[slack] failed to read the current workspace id: ${error instanceof Error ? error.message : String(error)}`,
    );

    return undefined;
  }
};
