import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

// A run never exceeds its agent nor the agent's application, whoever calls it
export const buildAgentRunAuthContext = ({
  authContext,
  agentId,
  application,
}: {
  authContext: WorkspaceAuthContext;
  agentId: string;
  application?: FlatApplication;
}): WorkspaceAuthContext => {
  switch (authContext.type) {
    case 'user':
    case 'apiKey':
      return {
        ...authContext,
        agentId,
        application: application ?? authContext.application,
      };
    case 'application':
      return { ...authContext, agentId };
    default:
      return authContext;
  }
};
