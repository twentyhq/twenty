import { isNonEmptyString } from '@sniptt/guards';
import { MetadataApiClient } from 'twenty-client-sdk/metadata';

export const fetchCurrentWorkspaceMemberId = async (): Promise<
  string | undefined
> => {
  const { currentUser } = await new MetadataApiClient().query({
    currentUser: { workspaceMember: { id: true } },
  });

  return isNonEmptyString(currentUser.workspaceMember?.id)
    ? currentUser.workspaceMember.id
    : undefined;
};
