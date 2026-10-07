// What a suspended run needs to continue without its caller building it again.
// Permissions are left out: the caller derives them anew on each continuation
export type AgentRunSpec = {
  // without an agent, the run uses the workspace's default model
  agentId: string | null;
  title: string;
  baseSystemPrompt: string;
  // the caller's own instructions, after what the engine says about its pausing tools
  instructions: string | null;
  capabilities: {
    // ask_question and request_form, answered from the conversation
    canAskHumans: boolean;
    // propose_tool_call, for an action a person approves first
    canProposeToolCalls: boolean;
    // wait_for_event and wait_for_duration, resolved by a wake-up
    canWait: boolean;
  };
  additionalExcludedToolNames?: string[];
};
