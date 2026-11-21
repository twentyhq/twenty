import { type ReactNode, Suspense } from 'react';

import { AiChatThreadStreamsEffect } from '@/ai-chat/instance/components/AiChatThreadStreamsEffect';
import { AiChatSyncEffect } from '@/ai-chat/instance/components/AiChatSyncEffect';

type AiChatProviderProps = {
  children: ReactNode;
};

export const AiChatProvider = ({ children }: AiChatProviderProps) => (
  <Suspense fallback={null}>
    <AiChatSyncEffect />
    <AiChatThreadStreamsEffect />
    {children}
  </Suspense>
);
