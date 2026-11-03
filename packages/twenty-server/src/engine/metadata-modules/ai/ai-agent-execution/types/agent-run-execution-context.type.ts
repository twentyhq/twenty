import { type ActorMetadata } from 'twenty-shared/types';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentConversationViewer } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-viewer.type';

// How a run acts, which its caller derives on each segment instead of the engine storing it
export type AgentRunExecutionContext = {
  authContext: WorkspaceAuthContext;
  actorContext?: ActorMetadata;
  // who the run's turns are recorded as sent by
  turnCreatedBy: ActorMetadata;
  userWorkspaceId: string | null;
  conversationViewer?: AgentConversationViewer;
};
