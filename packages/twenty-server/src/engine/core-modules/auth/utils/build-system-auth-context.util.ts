import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type SystemWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type SystemAuthContextInput = {
  workspace: NonNullable<RawAuthContext['workspace']>;
};

export const buildSystemAuthContext = (
  input: SystemAuthContextInput,
): SystemWorkspaceAuthContext => {
  return {
    type: 'system',
    workspace: input.workspace,
  };
};
