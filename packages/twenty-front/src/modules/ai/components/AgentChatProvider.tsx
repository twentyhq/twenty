import { type ReactNode, Suspense } from 'react';

import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { AgentChatThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { AgentChatThreadParticipantOperationsEffect } from '@/ai/components/AgentChatThreadParticipantOperationsEffect';
import { AgentChatThreadRecordOperationsEffect } from '@/ai/components/AgentChatThreadRecordOperationsEffect';
import { AgentChatToolIndexInvalidationEffect } from '@/ai/components/AgentChatToolIndexInvalidationEffect';

type AgentChatProviderProps = {
  children: ReactNode;
};

export const AgentChatProvider = ({ children }: AgentChatProviderProps) => (
  <Suspense fallback={null}>
    <AgentChatThreadInitializationEffect />
    <AgentChatThreadRecordOperationsEffect />
    <AgentChatThreadParticipantOperationsEffect />
    <AgentChatRuntimeEffects />
    <AgentChatToolIndexInvalidationEffect />
    {children}
  </Suspense>
);
