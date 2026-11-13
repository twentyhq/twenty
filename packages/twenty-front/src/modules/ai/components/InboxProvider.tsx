import { type ReactNode, Suspense } from 'react';

import { InboxChannelsEffect } from '@/ai/components/InboxChannelsEffect';
import { AgentChatRuntimeEffects } from '@/ai/components/AgentChatRuntimeEffects';
import { InboxThreadInitializationEffect } from '@/ai/components/InboxThreadInitializationEffect';
import { InboxThreadParticipantOperationsEffect } from '@/ai/components/InboxThreadParticipantOperationsEffect';
import { InboxThreadRecordOperationsEffect } from '@/ai/components/InboxThreadRecordOperationsEffect';
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
