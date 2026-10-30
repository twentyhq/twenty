import { isDefined } from 'twenty-shared/utils';

import { type RawAuthContext } from 'src/engine/core-modules/auth/types/raw-auth-context.type';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

type ApplicationAuthContextInput = {
  workspace: NonNullable<RawAuthContext['workspace']>;
  application: NonNullable<RawAuthContext['application']>;
  agentId?: RawAuthContext['agentId'];
};

export const buildApplicationAuthContext = (
  input: ApplicationAuthContextInput,
): ApplicationWorkspaceAuthContext => {
  return {
    type: 'application',
    workspace: input.workspace,
    application: input.application,
    ...(isDefined(input.agentId) ? { agentId: input.agentId } : {}),
  };
};
