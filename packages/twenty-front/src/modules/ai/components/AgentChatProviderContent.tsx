import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { AgentChatChannelsInitializationEffect } from '@/ai/components/AgentChatChannelsInitializationEffect';
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
        <AgentChatChannelsInitializationEffect />
        <AgentChatRuntimeEffects />
        {children}
      </AgentChatComponentInstanceContext.Provider>
    </Suspense>
  );
};
