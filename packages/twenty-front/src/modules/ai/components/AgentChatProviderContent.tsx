import { AgentChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatSessionStartTimeEffect } from '@/ai/components/AgentChatSessionStartTimeEffect';

import { AgentChatStreamingPartsDiffSyncEffect } from '@/ai/components/AgentChatStreamingPartsDiffSyncEffect';
import { AgentChatThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';
import { Suspense } from 'react';

export const AgentChatProviderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Suspense fallback={null}>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'agentChatComponentInstance' }}
      >
        <AgentChatThreadInitializationEffect />
        <AgentChatMessagesFetchEffect />
        <AgentChatStreamSubscriptionEffect />
        <AgentChatStreamingPartsDiffSyncEffect />
        <AgentChatSessionStartTimeEffect />
        {children}
      </AgentChatComponentInstanceContext.Provider>
    </Suspense>
  );
};
