import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export const withAuthContextAgent = ({
  authContext,
  agentId,
}: {
  authContext: WorkspaceAuthContext;
  agentId: string;
}): WorkspaceAuthContext => {
  switch (authContext.type) {
    case 'user':
    case 'apiKey':
    case 'application':
      return { ...authContext, agentId };
    default:
      return authContext;
  }
};
