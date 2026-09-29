import { type InputAskForm } from 'twenty-shared/ai';

export type AgentChatPendingAsk = {
  id: string;
  toolCallId: string;
  form: InputAskForm;
};
