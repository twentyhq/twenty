import { type ReactNode, Suspense } from 'react';

import { AiChatRuntimeEffects } from '@/ai-chat/components/AiChatRuntimeEffects';
import { AiChatThreadParticipantOperationsEffect } from '@/ai-chat/components/AiChatThreadParticipantOperationsEffect';
import { AiChatRuntimeContext } from '@/ai-chat/contexts/AiChatRuntimeContext';
import { AiChatToolIndexInvalidationEffect } from '@/ai-chat/components/AiChatToolIndexInvalidationEffect';

type AiChatProviderProps = {
  children: ReactNode;
};

export const AiChatProvider = ({ children }: AiChatProviderProps) => (
  <Suspense fallback={null}>
    <AiChatThreadParticipantOperationsEffect />
    <AiChatRuntimeEffects />
    <AiChatToolIndexInvalidationEffect />
    <AiChatRuntimeContext.Provider value={true}>
      {children}
    </AiChatRuntimeContext.Provider>
  </Suspense>
);
