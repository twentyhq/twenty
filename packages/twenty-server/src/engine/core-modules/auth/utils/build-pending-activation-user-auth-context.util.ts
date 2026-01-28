import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type PendingActivationUserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type PendingActivationUserAuthContextInput = {
  workspace: NonNullable<AuthContext['workspace']>;
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
  user: NonNullable<AuthContext['user']>;
  workspaceMetadataVersion?: string;
};

export const buildPendingActivationUserAuthContext = (
  input: PendingActivationUserAuthContextInput,
): PendingActivationUserWorkspaceAuthContext => {
  return {
    type: 'pendingActivationUser',
    workspace: input.workspace,
    userWorkspaceId: input.userWorkspaceId,
    user: input.user,
    workspaceMetadataVersion: input.workspaceMetadataVersion,
  };
};
