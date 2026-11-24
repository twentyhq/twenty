import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { isDefined } from 'twenty-sdk/utils';

export const getCurrentWorkspaceMemberIdOrThrow = async (): Promise<string> => {
  const { currentUser } = await new MetadataApiClient().query({
    currentUser: { workspaceMember: { id: true } },
  });
  const workspaceMemberId = currentUser.workspaceMember?.id;

  if (!isDefined(workspaceMemberId)) {
    throw new Error('The current user is not a member of this workspace');
  }

  return workspaceMemberId;
};
