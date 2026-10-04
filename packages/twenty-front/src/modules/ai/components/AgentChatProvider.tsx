import { type ReactNode, Suspense } from 'react';

import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { AgentChatThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { AgentChatThreadParticipantOperationsEffect } from '@/ai/components/AgentChatThreadParticipantOperationsEffect';
import { AgentChatThreadRecordOperationsEffect } from '@/ai/components/AgentChatThreadRecordOperationsEffect';
import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AgentChatComponentInstanceContext } from '@/ai/contexts/AgentChatComponentInstanceContext';

type AgentChatProviderProps = {
  children: ReactNode;
};

export const AgentChatProvider = ({ children }: AgentChatProviderProps) => (
  <Suspense fallback={null}>
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: AGENT_CHAT_INSTANCE_ID }}
    >
      <AgentChatThreadInitializationEffect />
      <AgentChatThreadRecordOperationsEffect />
      <AgentChatThreadParticipantOperationsEffect />
      <AgentChatRuntimeEffects />
      {children}
    </AgentChatComponentInstanceContext.Provider>
  </Suspense>
);
