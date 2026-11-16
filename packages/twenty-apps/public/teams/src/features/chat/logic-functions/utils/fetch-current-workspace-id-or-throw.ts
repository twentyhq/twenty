import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export const fetchCurrentWorkspaceIdOrThrow = async (): Promise<string> => {
  const { currentWorkspace } = await new MetadataApiClient().query({
    currentWorkspace: { id: true },
  });

  if (!isNonEmptyString(currentWorkspace?.id)) {
    throw new Error('Could not read the id of the current workspace');
  }

  return currentWorkspace.id;
};
