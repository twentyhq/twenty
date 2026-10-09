import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';

export type AgentRunCallerContext = {
  authContext: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  callerRoleId?: string;
};
