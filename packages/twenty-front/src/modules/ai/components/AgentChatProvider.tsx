import { type ReactNode, Suspense } from 'react';

import { InboxChannelsEffect } from '@/ai/components/AgentChatChannelsEffect';
import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { InboxThreadInitializationEffect } from '@/ai/components/AgentChatThreadInitializationEffect';
import { InboxThreadParticipantOperationsEffect } from '@/ai/components/AgentChatThreadParticipantOperationsEffect';
import { InboxThreadRecordOperationsEffect } from '@/ai/components/AgentChatThreadRecordOperationsEffect';
import { AgentChatToolIndexInvalidationEffect } from '@/ai/components/AgentChatToolIndexInvalidationEffect';

type InboxProviderProps = {
  children: ReactNode;
};

export const InboxProvider = ({ children }: InboxProviderProps) => (
  <Suspense fallback={null}>
    <InboxThreadInitializationEffect />
    <InboxThreadRecordOperationsEffect />
    <InboxThreadParticipantOperationsEffect />
    <InboxChannelsEffect />
    <AgentChatRuntimeEffects />
    <AgentChatToolIndexInvalidationEffect />
    {children}
  </Suspense>
);
