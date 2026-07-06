import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

// PREFILL only fills the chat editor with the text and waits for the user to send it.
// SEND fills the editor and automatically submits the message to the AI.
export type AgentChatPrepromptMode = 'PREFILL' | 'SEND';

export type AgentChatPreprompt = {
  text: string;
  mode: AgentChatPrepromptMode;
};

export const agentChatPrepromptState =
  createAtomState<AgentChatPreprompt | null>({
    key: 'ai/agentChatPrepromptState',
    defaultValue: null,
  });
