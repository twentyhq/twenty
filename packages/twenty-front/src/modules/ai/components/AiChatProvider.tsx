import { type ReactNode, Suspense } from 'react';

import { AiChatRuntimeEffects } from '@/ai/components/AiChatRuntimeEffects';
import { AiChatThreadParticipantOperationsEffect } from '@/ai/components/AiChatThreadParticipantOperationsEffect';
import { AiChatRuntimeContext } from '@/ai/contexts/AiChatRuntimeContext';
import { AiChatToolIndexInvalidationEffect } from '@/ai/components/AiChatToolIndexInvalidationEffect';

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
