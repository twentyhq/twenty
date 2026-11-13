import { type ReactNode, Suspense } from 'react';

import { InboxChannelsEffect } from '@/inbox/components/InboxChannelsEffect';
import { AiChatRuntimeEffects } from '@/ai/components/AiChatRuntimeEffects';
import { AiChatThreadInitializationEffect } from '@/ai/components/AiChatThreadInitializationEffect';
import { AiChatThreadParticipantOperationsEffect } from '@/ai/components/AiChatThreadParticipantOperationsEffect';
import { AiChatThreadRecordOperationsEffect } from '@/ai/components/AiChatThreadRecordOperationsEffect';
import { AiChatToolIndexInvalidationEffect } from '@/ai/components/AiChatToolIndexInvalidationEffect';

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
