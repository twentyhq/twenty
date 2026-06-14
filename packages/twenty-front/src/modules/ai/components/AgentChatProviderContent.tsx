import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
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
        <AgentChatRuntimeEffects />
        {children}
      </AgentChatComponentInstanceContext.Provider>
    </Suspense>
  );
};
