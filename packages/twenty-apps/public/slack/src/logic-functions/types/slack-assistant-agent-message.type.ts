import { type RunAgentInput } from 'twenty-sdk/logic-function';

export type SlackAssistantAgentMessage = NonNullable<
  RunAgentInput['messages']
>[number];
