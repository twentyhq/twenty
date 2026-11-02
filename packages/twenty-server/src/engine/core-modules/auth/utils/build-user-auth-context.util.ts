import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type UserSessionVariant } from 'src/engine/core-modules/auth/types/user-session-variant.type';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type UserAuthContextInput = {
  workspace: NonNullable<RawAuthContext['workspace']>;
  userWorkspaceId: NonNullable<RawAuthContext['userWorkspaceId']>;
  user: NonNullable<RawAuthContext['user']>;
  workspaceMemberId: NonNullable<RawAuthContext['workspaceMemberId']>;
  workspaceMember: NonNullable<RawAuthContext['workspaceMember']>;
  userSessionVariant: UserSessionVariant;
  application?: RawAuthContext['application'];
  agentId?: RawAuthContext['agentId'];
};

export const buildUserAuthContext = (
  input: UserAuthContextInput,
): UserWorkspaceAuthContext => {
  return {
    type: 'user',
    workspace: input.workspace,
    userWorkspaceId: input.userWorkspaceId,
    user: input.user,
    workspaceMemberId: input.workspaceMemberId,
    workspaceMember: input.workspaceMember,
    userSessionVariant: input.userSessionVariant,
    ...(isDefined(input.application) ? { application: input.application } : {}),
    ...(isDefined(input.agentId) ? { agentId: input.agentId } : {}),
  };
};
