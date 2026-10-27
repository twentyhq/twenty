import { useStore } from 'jotai';
import { useEffect } from 'react';

import { agentChatInboxTabSelectionState } from '@/ai/states/agentChatInboxTabSelectionState';
import { type AgentChatInboxTabSelection } from '@/ai/types/AgentChatInboxTabSelection';

type AiChatInboxTabSelectionEffectProps = {
  tabSelection: AgentChatInboxTabSelection | null;
};

export const AiChatInboxTabSelectionEffect = ({
  tabSelection,
}: AiChatInboxTabSelectionEffectProps) => {
  const store = useStore();

  useEffect(() => {
    store.set(agentChatInboxTabSelectionState.atom, tabSelection);

    return () => {
      store.set(agentChatInboxTabSelectionState.atom, null);
    };
  }, [store, tabSelection]);

  return null;
};
