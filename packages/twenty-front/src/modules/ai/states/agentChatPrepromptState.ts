import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

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
