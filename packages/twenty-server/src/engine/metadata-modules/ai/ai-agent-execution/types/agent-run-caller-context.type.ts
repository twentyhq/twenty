import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentRunRoleIds } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-role-ids.type';

export type AgentRunCallerContext = {
  authContext: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  callerRoleIds?: AgentRunRoleIds;
};
