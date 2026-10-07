import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type ApplicationWorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type ApplicationAgentContext = {
  application: FlatApplication;
  authContext: ApplicationWorkspaceAuthContext;
  agentRoleId: string | undefined;
};
