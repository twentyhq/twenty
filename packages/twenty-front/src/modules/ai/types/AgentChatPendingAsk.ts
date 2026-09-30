import { type InputAskForm } from 'twenty-shared/ai';

// A form step's Ask is answered from its run, never from a chat.
export type AgentChatPendingAsk = {
  id: string;
  toolCallId: string;
  form: Exclude<InputAskForm, { kind: 'formFields' }>;
};
