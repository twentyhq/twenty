import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type UserWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type UserAuthContextInput = {
  workspace: NonNullable<AuthContext['workspace']>;
  userWorkspaceId: NonNullable<AuthContext['userWorkspaceId']>;
  user: NonNullable<AuthContext['user']>;
  workspaceMemberId: NonNullable<AuthContext['workspaceMemberId']>;
  workspaceMember: NonNullable<AuthContext['workspaceMember']>;
  workspaceMetadataVersion?: string;
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
    workspaceMetadataVersion: input.workspaceMetadataVersion,
  };
};
