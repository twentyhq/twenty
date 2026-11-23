import { type ReactNode, Suspense } from 'react';

import { AiChatThreadStreamsEffect } from '@/ai-chat/instance/components/AiChatThreadStreamsEffect';
import { AiChatThreadParticipantsSyncEffect } from '@/ai-chat/instance/components/AiChatThreadParticipantsSyncEffect';
import { AiChatIsRuntimeMountedContext } from '@/ai-chat/contexts/AiChatIsRuntimeMountedContext';

type AiChatProviderProps = {
  children: ReactNode;
};

export const AiChatProvider = ({ children }: AiChatProviderProps) => (
  <Suspense fallback={null}>
    <AiChatThreadParticipantsSyncEffect />
    <AiChatThreadStreamsEffect />
    <AiChatIsRuntimeMountedContext.Provider value={true}>
      {children}
    </AiChatIsRuntimeMountedContext.Provider>
  </Suspense>
);
