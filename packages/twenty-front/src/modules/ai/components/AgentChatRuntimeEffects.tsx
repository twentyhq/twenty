import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatSessionStartTimeEffect } from '@/ai/components/AgentChatSessionStartTimeEffect';
import { AgentChatStreamKeepAliveEffect } from '@/ai/components/AgentChatStreamKeepAliveEffect';
import { AgentChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';
import { AgentChatStreamingPartsDiffSyncEffect } from '@/ai/components/AgentChatStreamingPartsDiffSyncEffect';
import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useEffect } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

export const AgentChatRuntimeEffects = () => {
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
  const sidePanelPage = useAtomStateValue(sidePanelPageState);

  const [hasAgentChatBeenOpened, setHasAgentChatBeenOpened] = useAtomState(
    hasAgentChatBeenOpenedState,
  );

  const isAgentChatOpen =
    isSidePanelOpened && sidePanelPage === SidePanelPages.AskAI;

  useEffect(() => {
    if (isAgentChatOpen && !hasAgentChatBeenOpened) {
      setHasAgentChatBeenOpened(true);
    }
  }, [isAgentChatOpen, hasAgentChatBeenOpened, setHasAgentChatBeenOpened]);

  if (!hasAgentChatBeenOpened) {
    return null;
  }

  return (
    <>
      <AgentChatMessagesFetchEffect />
      <AgentChatStreamSubscriptionEffect />
      <AgentChatStreamKeepAliveEffect />
      <AgentChatSessionStartTimeEffect />
      {isAgentChatOpen && (
        <>
          <AgentChatStreamingPartsDiffSyncEffect />
          <AgentChatStreamingAutoScrollEffect />
        </>
      )}
    </>
  );
};
