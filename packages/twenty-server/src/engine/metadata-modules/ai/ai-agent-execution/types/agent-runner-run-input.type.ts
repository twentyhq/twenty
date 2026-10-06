import { type RunAgentMessage } from 'twenty-shared/application';
import { type ActorMetadata } from 'twenty-shared/types';

import { type AgentAsyncExecutorService } from 'src/engine/metadata-modules/ai/ai-agent-execution/services/agent-async-executor.service';
import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';
import { type AgentConversationActor } from 'src/engine/metadata-modules/ai/ai-history/types/agent-conversation-actor.type';

export type AgentRunnerRunInput = {
  workspaceId: string;
  conversation: AgentRunConversation;
  // who the continued conversation is read for, so turns others acted on read as theirs
  conversationActor?: AgentConversationActor;
  // set when the caller waits on the calls the run pauses on
  caller?: AgentRunCaller;
  turn: {
    // names the thread when the turn creates it
    title: string;
    senderUserWorkspaceId: string | null;
    senderApplicationId: string | null;
    messages: RunAgentMessage[];
    // resolved while recording the turn, so a failed lookup does not stop the run
    resolveCreatedBy: () => Promise<ActorMetadata>;
  };
  execution: Omit<
    Parameters<AgentAsyncExecutorService['executeAgent']>[0],
    'priorMessages'
  >;
};
