import { type ReactNode, Suspense } from 'react';

import { AiChatThreadStreamsEffect } from '@/ai-chat/instance/components/AiChatThreadStreamsEffect';
import { AiChatSyncEffect } from '@/ai-chat/instance/components/AiChatSyncEffect';
import { AiChatRuntimeContext } from '@/ai-chat/contexts/AiChatRuntimeContext';

type AiChatProviderProps = {
  children: ReactNode;
};

export const AiChatProvider = ({ children }: AiChatProviderProps) => (
  <Suspense fallback={null}>
    <AiChatSyncEffect />
    <AiChatThreadStreamsEffect />
    <AiChatRuntimeContext.Provider value={true}>
      {children}
    </AiChatRuntimeContext.Provider>
  </Suspense>
);
