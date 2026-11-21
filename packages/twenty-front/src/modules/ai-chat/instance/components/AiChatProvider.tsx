import { type ReactNode, Suspense } from 'react';

import { AiChatThreadEventStreamEffects } from '@/ai-chat/instance/components/AiChatThreadEventStreamEffects';
import { AiChatThreadParticipantOperationsEffect } from '@/ai-chat/threads/components/AiChatThreadParticipantOperationsEffect';
import { AiChatRuntimeContext } from '@/ai-chat/contexts/AiChatRuntimeContext';
import { AiChatToolIndexInvalidationEffect } from '@/ai-chat/tool-calls/components/AiChatToolIndexInvalidationEffect';

type AiChatProviderProps = {
  children: ReactNode;
};

export const AiChatProvider = ({ children }: AiChatProviderProps) => (
  <Suspense fallback={null}>
    <AiChatThreadParticipantOperationsEffect />
    <AiChatThreadEventStreamEffects />
    <AiChatToolIndexInvalidationEffect />
    <AiChatRuntimeContext.Provider value={true}>
      {children}
    </AiChatRuntimeContext.Provider>
  </Suspense>
);
