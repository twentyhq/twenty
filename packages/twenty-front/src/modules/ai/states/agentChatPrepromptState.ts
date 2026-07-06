import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type AgentChatPrepromptMode = 'PREFILL' | 'SEND';

export type AgentChatPreprompt = {
  text: string;
  mode: AgentChatPrepromptMode;
  // The thread this preprompt targets. The effect only applies it while the
  // current thread still matches, so a thread switch in between (e.g. the
  // thread-initialization effect) can't misapply it to the wrong conversation.
  threadId: string;
};

export const agentChatPrepromptState =
  createAtomState<AgentChatPreprompt | null>({
    key: 'ai/agentChatPrepromptState',
    defaultValue: null,
  });
