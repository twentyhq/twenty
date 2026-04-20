import { AgentChatStreamSubscriptionEffect } from '@/ai/components/AgentChatStreamSubscriptionEffect';
import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatSessionStartTimeEffect } from '@/ai/components/AgentChatSessionStartTimeEffect';

import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';
import { AgentChatStreamingPartsDiffSyncEffect } from '@/ai/components/AgentChatStreamingPartsDiffSyncEffect';
import { AgentChatThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
import { Suspense } from 'react';

export const AgentChatProviderContent = ({
  children,
  isAiEnabled,
}: {
  children: React.ReactNode;
  isAiEnabled: boolean;
}) => {
  return (
    <Suspense fallback={null}>
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'agentChatComponentInstance' }}
      >
        {isAiEnabled && (
          <>
            <AgentChatThreadInitializationEffect />
            <AgentChatMessagesFetchEffect />
            <AgentChatStreamSubscriptionEffect />
            <AgentChatStreamingPartsDiffSyncEffect />
            <AgentChatSessionStartTimeEffect />
            <AgentChatStreamingAutoScrollEffect />
          </>
        )}
        {children}
      </AgentChatComponentInstanceContext.Provider>
    </Suspense>
  );
};
