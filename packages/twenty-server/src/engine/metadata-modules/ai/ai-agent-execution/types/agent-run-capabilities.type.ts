export type AgentRunCapabilities = {
  // ask_question and request_form, answered from the conversation
  canAskHumans: boolean;
  // propose_tool_call, for an action a person approves first
  canProposeToolCalls: boolean;
  // wait_for_event and wait_for_duration, resolved by a wake-up
  canWait: boolean;
};
