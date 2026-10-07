import { type RunAgentMessage } from 'twenty-shared/application';

import { type AgentRunCaller } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller.type';
import { type AgentRunConversation } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-conversation.type';
import { type AgentRunExecutionContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-execution-context.type';
import { type AgentRunSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';

// A run that pauses is suspended with its spec, and the engine continues it on its own and hands
// the outcome to its caller's handler
export type AgentRunnerRunInput = {
  workspaceId: string;
  // set by a caller that must name the run even when it throws; generated otherwise
  runId?: string;
  conversation: AgentRunConversation;
  caller: AgentRunCaller;
  spec: AgentRunSpec;
  agent: AgentEntity | null;
  // what the run is asked and who asked it; absent when the run continues its conversation without a new message
  prompt: {
    messages: RunAgentMessage[];
    senderUserWorkspaceId: string | null;
    senderApplicationId: string | null;
  } | null;
  executionContext: AgentRunExecutionContext;
};
