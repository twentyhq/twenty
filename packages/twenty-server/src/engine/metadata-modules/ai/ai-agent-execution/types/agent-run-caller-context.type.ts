import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentRoleRestrictions } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-role-restrictions.type';

export type AgentRunCallerContext = {
  authContext: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  roleRestrictions?: AgentRoleRestrictions;
};
