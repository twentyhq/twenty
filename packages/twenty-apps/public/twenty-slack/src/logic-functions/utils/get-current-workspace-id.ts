import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export const getCurrentWorkspaceId = async (): Promise<string> => {
  const client = new MetadataApiClient();

  const result = await client.query({
    currentWorkspace: { id: true },
  });

  const workspaceId = result.currentWorkspace?.id;

  if (!isNonEmptyString(workspaceId)) {
    throw new Error('Could not resolve the current workspace id');
  }

  return workspaceId;
};
