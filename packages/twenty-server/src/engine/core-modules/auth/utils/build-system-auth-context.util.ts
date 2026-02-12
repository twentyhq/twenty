import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type SystemWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type SystemAuthContextInput = {
  workspace: NonNullable<AuthContext['workspace']>;
  workspaceMetadataVersion?: string;
};

export const buildSystemAuthContext = (
  input: SystemAuthContextInput,
): SystemWorkspaceAuthContext => {
  return {
    type: 'system',
    workspace: input.workspace,
    workspaceMetadataVersion: input.workspaceMetadataVersion,
  };
};
