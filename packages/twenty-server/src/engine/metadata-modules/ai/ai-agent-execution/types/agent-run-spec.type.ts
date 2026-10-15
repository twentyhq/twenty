import { type AgentResponseFormat } from 'twenty-shared/ai';

import { type AgentToolLoadingStrategy } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-tool-loading-strategy.type';

// What a suspended run needs to continue without its caller building it again.
// Permissions are left out: the caller derives them anew on each continuation
export type AgentRunSpec = {
  agentId: string;
  title: string;
  baseSystemPrompt: string;
  // the caller's own instructions, after what the engine says about its pausing tools
  instructions: string | null;
  responseFormat?: AgentResponseFormat;
  capabilities: {
    // ask_question, request_form and propose_tool_call, answered from the conversation
    canAskHumans: boolean;
  };
  additionalExcludedToolNames?: string[];
  toolLoadingStrategy?: AgentToolLoadingStrategy;
};
