import { type RawAuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type ApplicationAuthContextInput = {
  workspace: NonNullable<RawAuthContext['workspace']>;
  application: NonNullable<RawAuthContext['application']>;
  workspaceMetadataVersion?: string;
};

export const buildApplicationAuthContext = (
  input: ApplicationAuthContextInput,
): ApplicationWorkspaceAuthContext => {
  return {
    type: 'application',
    workspace: input.workspace,
    application: input.application,
    workspaceMetadataVersion: input.workspaceMetadataVersion,
  };
};
