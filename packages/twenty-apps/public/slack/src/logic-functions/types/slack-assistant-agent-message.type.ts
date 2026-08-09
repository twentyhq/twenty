import { type RunAgentInput } from 'twenty-sdk/logic-function';

// The installed twenty-sdk release (2.29.0) declares RunAgentMessage but does
// not export it; this PR adds that barrel export, so switch to a direct import
// once a release containing it ships
export type SlackAssistantAgentMessage = NonNullable<
  RunAgentInput['messages']
>[number];
