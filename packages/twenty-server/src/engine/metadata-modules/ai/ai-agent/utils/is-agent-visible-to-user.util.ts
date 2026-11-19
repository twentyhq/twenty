import { isDefined } from 'twenty-shared/utils';

export const isAgentVisibleToUser = ({
  agent,
  userWorkspaceId,
}: {
  agent: { isPrivate: boolean; createdByUserWorkspaceId?: string | null };
  userWorkspaceId: string | undefined;
}): boolean =>
  !agent.isPrivate ||
  (isDefined(userWorkspaceId) &&
    agent.createdByUserWorkspaceId === userWorkspaceId);
