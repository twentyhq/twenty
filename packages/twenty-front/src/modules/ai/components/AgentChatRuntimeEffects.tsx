import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatPrepromptEffect } from '@/ai/components/AgentChatPrepromptEffect';
import { AgentChatSessionStartTimeEffect } from '@/ai/components/AgentChatSessionStartTimeEffect';
import { AgentChatStreamKeepAliveEffect } from '@/ai/components/AgentChatStreamKeepAliveEffect';
import { AgentChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { AgentChatThreadParticipantsFetchEffect } from '@/ai/components/AgentChatThreadParticipantsFetchEffect';
import { AgentChatThreadReadsFetchEffect } from '@/ai/components/AgentChatThreadReadsFetchEffect';
import { hasAgentChatBeenOpenedState } from '@/ai/states/hasAgentChatBeenOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const AgentChatRuntimeEffects = () => {
  const hasAgentChatBeenOpened = useAtomStateValue(hasAgentChatBeenOpenedState);

  if (!hasAgentChatBeenOpened) {
    return null;
  }

  return (
    <>
      <AgentChatMessagesFetchEffect />
      <AgentChatThreadParticipantsFetchEffect />
      <AgentChatThreadReadsFetchEffect />
      <AgentChatStreamSubscriptionEffect />
      <AgentChatPrepromptEffect />
      <AgentChatStreamKeepAliveEffect />
      <AgentChatSessionStartTimeEffect />
    </>
  );
};
