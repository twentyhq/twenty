import { type ProposedToolCallAnswer } from 'src/engine/metadata-modules/ai/ai-agent-execution/pausing-tools/types/proposed-tool-call-answer.type';

export type AgentCallerInboxDelivery =
  | { status: 'DELIVERED'; threadId: string }
  // the member deleted the conversation, so the call can no longer be answered
  | { status: 'DISMISSED'; threadId: string }
  // the caller waits, and gets the answer through its handler's onOutcome
  | { status: 'AWAITING'; threadId: string }
  // a message sent before already holds the answer
  | { status: 'ANSWERED'; threadId: string; answer: ProposedToolCallAnswer };
