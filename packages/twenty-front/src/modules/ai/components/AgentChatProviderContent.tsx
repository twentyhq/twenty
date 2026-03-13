import { AgentChatAiSdkStreamEffect } from '@/ai/components/AgentChatAiSdkStreamEffect';
import { AgentChatStreamingPartsDiffSyncEffect } from '@/ai/components/AgentChatStreamingPartsDiffSyncEffect';
import { AgentChatMessagesFetchEffect } from '@/ai/components/AgentChatMessagesFetchEffect';
import { AgentChatSessionStartTimeEffect } from '@/ai/components/AgentChatSessionStartTimeEffect';
import { AgentChatStreamingAutoScrollEffect } from '@/ai/components/AgentChatStreamingAutoScrollEffect';
import { AgentChatThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';
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
        <AgentChatAiSdkStreamEffect />
        <AgentChatStreamingPartsDiffSyncEffect />
        <AgentChatSessionStartTimeEffect />
        <AgentChatStreamingAutoScrollEffect />
        {children}
      </AgentChatComponentInstanceContext.Provider>
    </Suspense>
  );
};
