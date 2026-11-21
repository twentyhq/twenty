import { type ReactNode, Suspense } from 'react';

import { AiChatThreadStreamsEffect } from '@/ai-chat/instance/components/AiChatThreadStreamsEffect';
import { AiChatThreadParticipantsSyncEffect } from '@/ai-chat/instance/components/AiChatThreadParticipantsSyncEffect';
import { AiChatRuntimeContext } from '@/ai-chat/contexts/AiChatRuntimeContext';

type AiChatProviderProps = {
  children: ReactNode;
};

export const AiChatProvider = ({ children }: AiChatProviderProps) => (
  <Suspense fallback={null}>
    <AiChatThreadParticipantsSyncEffect />
    <AiChatThreadStreamsEffect />
    <AiChatRuntimeContext.Provider value={true}>
      {children}
    </AiChatRuntimeContext.Provider>
  </Suspense>
);
