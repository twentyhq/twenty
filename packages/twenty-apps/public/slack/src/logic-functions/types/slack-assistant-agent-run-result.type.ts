import { type RunAgentResult } from 'twenty-sdk/logic-function';

export type SlackAssistantAgentRunResult =
  | RunAgentResult
  | { threadId: null; result: null; error: string; success: false };
