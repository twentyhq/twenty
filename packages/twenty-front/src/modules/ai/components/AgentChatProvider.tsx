import { type ReactNode, Suspense } from 'react';

import { InboxChannelsEffect } from '@/ai/components/AgentChatChannelsEffect';
import { AiChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { AiChatThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { AiChatThreadParticipantOperationsEffect } from '@/ai/components/AgentChatThreadParticipantOperationsEffect';
import { AiChatThreadRecordOperationsEffect } from '@/ai/components/AgentChatThreadRecordOperationsEffect';
import { AiChatToolIndexInvalidationEffect } from '@/ai/components/AgentChatToolIndexInvalidationEffect';

type AiChatProviderProps = {
  children: ReactNode;
};

export const AiChatProvider = ({ children }: AiChatProviderProps) => (
  <Suspense fallback={null}>
    <AiChatThreadInitializationEffect />
    <AiChatThreadRecordOperationsEffect />
    <AiChatThreadParticipantOperationsEffect />
    <InboxChannelsEffect />
    <AiChatRuntimeEffects />
    <AiChatToolIndexInvalidationEffect />
    {children}
  </Suspense>
);
