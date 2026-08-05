import { type RunAgentInput } from 'twenty-sdk/logic-function';

// The SDK does not re-export RunAgentMessage by name yet, so derive it from
// the runAgent input union
export type SlackAssistantAgentMessage = NonNullable<
  RunAgentInput['messages']
>[number];
