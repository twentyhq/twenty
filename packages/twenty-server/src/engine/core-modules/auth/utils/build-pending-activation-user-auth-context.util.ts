import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type PendingActivationUserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type PendingActivationUserAuthContextInput = {
  workspace: NonNullable<RawAuthContext['workspace']>;
  userWorkspaceId: NonNullable<RawAuthContext['userWorkspaceId']>;
  user: NonNullable<RawAuthContext['user']>;
};

export const buildPendingActivationUserAuthContext = (
  input: PendingActivationUserAuthContextInput,
): PendingActivationUserWorkspaceAuthContext => {
  return {
    type: 'pendingActivationUser',
    workspace: input.workspace,
    userWorkspaceId: input.userWorkspaceId,
    user: input.user,
  };
};
